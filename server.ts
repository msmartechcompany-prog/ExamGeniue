/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Subject } from './src/types';
import { 
  OFFLINE_QUESTION_BANK, 
  getOfflineQuestions, 
  getOfflineRevisionSheet, 
  getOfflineFlashcards 
} from './src/offlineDatabase';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI client (Server-Side Only)
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("Successfully initialized GoogleGenAI SDK.");
  } else {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. AI features will fallback to client simulation.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI:", e);
}

// In-Memory API Response Cache to prevent duplicate calls
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes cache TTL

function getCacheKey(endpoint: string, params: any): string {
  try {
    return `${endpoint}:${JSON.stringify(params)}`;
  } catch (e) {
    return `${endpoint}:${Math.random()}`;
  }
}

function getCachedResponse(endpoint: string, params: any): any | null {
  const key = getCacheKey(endpoint, params);
  const cached = apiCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[Cache Hit] Serving cached response for endpoint: ${endpoint}`);
    return cached.data;
  }
  return null;
}

function setCachedResponse(endpoint: string, params: any, data: any) {
  const key = getCacheKey(endpoint, params);
  apiCache.set(key, { data, timestamp: Date.now() });
}

// Quota and Rate Limit State Management
interface QuotaState {
  isQuotaExhausted: boolean;
  exhaustionType: 'RPM' | 'DAILY' | 'NONE';
  last429Time: number;
  lastSuccessfulTime: number;
  retryDelayMs: number;
  consecutive429s: number;
}

const quotaState: QuotaState = {
  isQuotaExhausted: false,
  exhaustionType: 'NONE',
  last429Time: 0,
  lastSuccessfulTime: Date.now(),
  retryDelayMs: 0,
  consecutive429s: 0,
};

function registerApiSuccess() {
  quotaState.lastSuccessfulTime = Date.now();
  quotaState.consecutive429s = 0;
  if (quotaState.exhaustionType === 'RPM') {
    quotaState.isQuotaExhausted = false;
    quotaState.exhaustionType = 'NONE';
  }
}

function registerApi429(error: any) {
  quotaState.last429Time = Date.now();
  quotaState.consecutive429s++;
  
  let parsedDelay = 0;
  try {
    // Stringify entire error including metadata, message, response, or details to locate retryDelay
    const errStr = JSON.stringify(error) + " " + (error?.message || "") + " " + (error?.stack || "");
    const match = errStr.match(/"retryDelay"\s*:\s*"([0-9.]+)s"/);
    if (match && match[1]) {
      parsedDelay = parseFloat(match[1]) * 1000;
    } else {
      const matchNum = errStr.match(/"retryDelay"\s*:\s*(\d+)/);
      if (matchNum && matchNum[1]) {
        parsedDelay = parseInt(matchNum[1], 10);
      }
    }
  } catch (e) {}

  // Exponential backoff fallback if no retryDelay is directly parsed from the error
  quotaState.retryDelayMs = parsedDelay || Math.min(1500 * Math.pow(2, quotaState.consecutive429s), 30000);
  
  const errMessage = (error?.message || "").toLowerCase();
  const isDaily = errMessage.includes("daily") || 
                  errMessage.includes("limit_exceeded") || 
                  errMessage.includes("free_tier_requests") && quotaState.consecutive429s > 2;

  if (isDaily || quotaState.consecutive429s > 3) {
    quotaState.isQuotaExhausted = true;
    quotaState.exhaustionType = 'DAILY';
    console.error("CRITICAL: Gemini RPD Daily Quota Exhausted! Enabled persistent offline fallback mode.");
  } else {
    quotaState.isQuotaExhausted = true;
    quotaState.exhaustionType = 'RPM';
    console.warn(`WARNING: Gemini RPM limit reached. Delaying requests for ${quotaState.retryDelayMs}ms.`);
  }
}

// Map user subject parameters safely to our standard Enums
function mapStringToSubject(subStr: string): Subject {
  const norm = (subStr || "").toLowerCase().trim();
  if (norm.includes("physics")) return Subject.Physics;
  if (norm.includes("chemistry")) return Subject.Chemistry;
  if (norm.includes("math") || norm.includes("calculus") || norm.includes("algebra") || norm.includes("trig")) return Subject.Mathematics;
  if (norm.includes("biology") || norm.includes("zoology") || norm.includes("botany") || norm.includes("dna")) return Subject.Biology;
  if (norm.includes("computer") || norm.includes("software") || norm.includes("algorithm") || norm.includes("cs") || norm.includes("operating")) return Subject.ComputerScience;
  if (norm.includes("engineering") || norm.includes("circuit") || norm.includes("thermodynamics") || norm.includes("mechanic") || norm.includes("electrical")) return Subject.Engineering;
  if (norm.includes("medical") || norm.includes("anatomy") || norm.includes("pharmac") || norm.includes("cardio") || norm.includes("heart")) return Subject.Medical;
  if (norm.includes("law") || norm.includes("constitutional") || norm.includes("tort") || norm.includes("legal")) return Subject.Law;
  if (norm.includes("business") || norm.includes("finance") || norm.includes("marketing") || norm.includes("econ")) return Subject.Business;
  
  return Subject.Physics; // Default
}

// Smart retry wrapper with exponential backoff and quota awareness
async function generateContentWithRetry(params: any, retries = 3, delayMs = 2000): Promise<any> {
  if (quotaState.exhaustionType === 'DAILY') {
    throw new Error("429 RESOURCE_EXHAUSTED: Daily quota limits reached on free tier.");
  }

  const timeSinceLast429 = Date.now() - quotaState.last429Time;
  if (quotaState.exhaustionType === 'RPM' && timeSinceLast429 < quotaState.retryDelayMs) {
    const sleepTime = quotaState.retryDelayMs - timeSinceLast429;
    console.log(`[Rate Limiting Pause] Sleeping for ${sleepTime}ms before triggering request...`);
    await new Promise(resolve => setTimeout(resolve, sleepTime));
  }

  try {
    if (!ai) {
      throw new Error("Gemini API client not initialized.");
    }
    const result = await ai.models.generateContent(params);
    registerApiSuccess();
    return result;
  } catch (error: any) {
    const errStatus = error?.status || error?.statusCode;
    const errMessage = error?.message || "";
    const is429 = errStatus === 429 || 
                  errMessage.includes("429") || 
                  errMessage.toLowerCase().includes("resource_exhausted") || 
                  errMessage.toLowerCase().includes("quota exceeded") ||
                  errMessage.toLowerCase().includes("limit reached");

    if (is429) {
      registerApi429(error);
      
      if ((quotaState.exhaustionType as string) === 'DAILY') {
        throw new Error("429 RESOURCE_EXHAUSTED: Daily quota limits reached on free tier.");
      }

      if (retries > 0) {
        const nextDelay = quotaState.retryDelayMs || (delayMs * 1.5);
        console.log(`Retrying rate-limited endpoint in ${nextDelay}ms. Retries left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, nextDelay));
        return generateContentWithRetry(params, retries - 1, nextDelay * 1.5);
      }
    }
    throw error;
  }
}

// Fallback Generators to ensure continuous 100% uptime when APIs are offline/rate-limited
function getAnalyzeMaterialFallback(materialName: string, subject: string) {
  const finalSubject = subject || "Syllabus Core";
  return {
    subject: finalSubject,
    overallSyllabusSummary: `This study material/syllabus covers foundational principles of ${finalSubject}. Active system calibration analysis maps key mathematical, structural and analytical limits.`,
    chapters: [
      {
        name: "Chapter 1: Foundational Principles",
        weightage: 30,
        importanceLevel: "High" as const,
        frequentQuestionsCount: 4,
        description: "Focuses on introductory theories, standard parameters, and first-principles setups."
      },
      {
        name: "Chapter 2: Advanced Calculations & Applications",
        weightage: 40,
        importanceLevel: "High" as const,
        frequentQuestionsCount: 5,
        description: "Covers rigorous mathematical formulas, derivation logic, and boundary-value problems."
      },
      {
        name: "Chapter 3: Experimental Diagnostics & HOTS",
        weightage: 30,
        importanceLevel: "Medium" as const,
        frequentQuestionsCount: 3,
        description: "Explores laboratory diagnostic settings, error tolerances, and deep critical-thinking problems."
      }
    ],
    keyIdentifiedConcepts: [
      "Defining clear steady-state standard boundary thresholds",
      "Analyzing variable responses under external systemic stresses",
      "Resolving formula derivations from base conservation laws"
    ],
    weakTopicsRecommendation: [
      "Complex numerical proofs (review steps in detail)",
      "System responses under transient load conditions"
    ],
    offlineMode: true
  };
}

function getGenerateQuestionsFallback(subject: string, type: string, difficulty: string, chapter: string, count: number) {
  const mappedSub = mapStringToSubject(subject);
  return getOfflineQuestions(mappedSub, type, difficulty, count);
}

function getGeneratePaperFallback(subject: string, difficulty: string, stream: string, branch: string, gradeClass: string, examType: string, numQuestions: number, totalMarks: number, chapterTopic: string) {
  const mappedSub = mapStringToSubject(subject);
  const questionsCount = numQuestions || 8;
  const targetMarks = totalMarks || 50;
  
  // Use our subject-specific database to pull high-quality offline questions
  const mcqs = getOfflineQuestions(mappedSub, "MCQ", difficulty, Math.max(2, Math.floor(questionsCount * 0.4)));
  const shorts = getOfflineQuestions(mappedSub, "Short Answer", difficulty, Math.max(2, Math.floor(questionsCount * 0.3)));
  const longs = getOfflineQuestions(mappedSub, "Long Answer", difficulty, Math.max(2, Math.floor(questionsCount * 0.3)));

  const sections = [
    {
      name: "Section A: Multiple Choice Questions (MCQs)",
      description: "Select the single best answer for each question.",
      totalMarks: Math.round(targetMarks * 0.3),
      questions: mcqs
    },
    {
      name: "Section B: Short and Long Answer Section",
      description: "Answer precise explanations and step-by-step proofs. Show all calculations and units.",
      totalMarks: Math.round(targetMarks * 0.7),
      questions: [...shorts, ...longs]
    }
  ];

  return {
    title: `${gradeClass || "Class 12"} ${subject || "Unified Study"} ${examType || "Comprehensive Evaluation"}`,
    subject: subject || "General",
    totalMarks: targetMarks,
    difficulty: difficulty || "Medium",
    pattern: "Structured Exam Sheet",
    instructions: [
      "Answer all questions following section directives.",
      "Show all numerical formulas, units, and derivation boundaries for Section B.",
      "Time allowed is 180 minutes."
    ],
    sections,
    offlineMode: true
  };
}

function getGenerateRevisionSheetFallback(subject: string, chapter: string) {
  const mappedSub = mapStringToSubject(subject);
  const sheet = getOfflineRevisionSheet(mappedSub, chapter || "");
  return {
    ...sheet,
    offlineMode: true
  };
}

function getGenerateFlashcardsFallback(branchOrClass: string, subject: string, difficulty: string) {
  const mappedSub = mapStringToSubject(subject);
  return getOfflineFlashcards(mappedSub, branchOrClass);
}

function getGeneratePlannerFallback(subject: string, daysDuration: number, dailyCommitmentMinutes: number, weakTopics: string[]) {
  const finalSubject = subject || "Core Syllabus";
  const days = daysDuration || 7;
  const mins = dailyCommitmentMinutes || 60;
  const topics = weakTopics && weakTopics.length > 0 ? weakTopics : ["Foundational Theories", "Core Calculations", "Syllabus Review"];

  const tasks = [];
  for (let i = 1; i <= days; i++) {
    const topicIdx = (i - 1) % topics.length;
    tasks.push({
      day: i,
      topic: `Mastery of ${topics[topicIdx]}`,
      description: `Spend ${mins} minutes: Review core notes on ${topics[topicIdx]}, complete practice questions, and run through active-recall study cards.`,
      completed: false
    });
  }

  return {
    id: `planner-off-${Date.now()}`,
    subject: finalSubject,
    daysDuration: days,
    dailyCommitmentMinutes: mins,
    tasks,
    offlineMode: true
  };
}

function getStudyAssistanceFallback(query: string, subject: string, difficulty: string) {
  return {
    response: `### ExamPrep AI Assistant (Offline Mode)\n\n*Our AI servers are currently resting. Serving pre-compiled offline resources for your query:* **"${query}"** in **${subject || "General Science"}**:\n\n---\n\n#### 1. Core Concept Overview\nFocus on the foundational physics, chemical steps, or design equations associated with this question block. Start with the governing formulas and map out known parameters.\n\n#### 2. General Strategy & Problem Solving Steps\n1. **Draw a Boundary Representation**: Identify inputs, system bounds, and outputs.\n2. **Check Dimensional Consistency**: Make sure variables align with SI standard scales.\n3. **Isolate the Unknown**: Move variables systematically to solve calculations cleanly.\n\n*Please try again later when AI services resume!*`,
    offlineMode: true
  };
}

// 0. GET Quota & Rate Limit status
app.get('/api/quota-status', (req, res) => {
  res.json({
    isQuotaExhausted: quotaState.isQuotaExhausted,
    exhaustionType: quotaState.exhaustionType,
    retryDelayMs: quotaState.retryDelayMs,
    usingFallbackMode: quotaState.isQuotaExhausted || !ai,
  });
});

// 1. Analyze study materials
app.post('/api/analyze-material', async (req, res) => {
  const { materialName, materialContent, subject } = req.body;
  
  // Cache lookup
  const cached = getCachedResponse('/api/analyze-material', req.body);
  if (cached) {
    res.setHeader('X-Offline-Mode', cached.offlineMode ? 'true' : 'false');
    return res.json(cached);
  }

  try {
    if (!materialContent) {
      return res.status(400).json({ error: "No study materials or text content provided." });
    }

    const prompt = `Analyze the syllabus / study material titled "${materialName}" for the subject "${subject || 'General'}".
Extract the high-level outline, chapters, and topics. For each chapter, estimate their relative weightage (sum of chapters should be around 100%), define importance levels, count likely frequent exam questions, and explain key sub-topics.
Also extract a short summary of the syllabus, overall key concepts, and give specific recommendations on what areas a student might find difficult or should focus on.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: [
        { text: prompt },
        { text: `STUDY MATERIAL CONTENT:\n${materialContent.substring(0, 40000)}` }
      ],
      config: {
        systemInstruction: "You are an expert exam analyzer and high-school / university academic counselor. Return accurate structured analytical evaluations based on syllabus standards.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            overallSyllabusSummary: { type: Type.STRING, description: "Highly insightful paragraph summary of the uploaded document contents." },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the chapter or main study module" },
                  weightage: { type: Type.INTEGER, description: "Percentage weightage out of 100" },
                  importanceLevel: { type: Type.STRING, description: "Importance rate: 'High' or 'Medium' or 'Low'" },
                  frequentQuestionsCount: { type: Type.INTEGER, description: "Approximate count of historically frequently repeated questions in this chapter" },
                  description: { type: Type.STRING, description: "Sub-topics and core focus details" }
                },
                required: ["name", "weightage", "importanceLevel", "frequentQuestionsCount", "description"]
              }
            },
            keyIdentifiedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A bullet list of 5 important distinct scientific, logical or conceptual paradigms to know."
            },
            weakTopicsRecommendation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Syllabus blocks that students commonly struggle with and recommendations for mastering them."
            }
          },
          required: ["subject", "overallSyllabusSummary", "chapters", "keyIdentifiedConcepts", "weakTopicsRecommendation"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    const finalData = { ...parsedData, offlineMode: false };
    
    setCachedResponse('/api/analyze-material', req.body, finalData);
    res.setHeader('X-Offline-Mode', 'false');
    res.json(finalData);
  } catch (error: any) {
    console.error("Error in analyzer endpoint (falling back to curriculum structure):", error);
    try {
      res.setHeader('X-Offline-Mode', 'true');
      const fallback = { ...getAnalyzeMaterialFallback(materialName, subject), offlineMode: true };
      res.json(fallback);
    } catch (fbError) {
      res.status(500).json({ error: "Failed to compile study material metadata." });
    }
  }
});

// 2. Generate questions categorised by type
app.post('/api/generate-questions', async (req, res) => {
  const { subject, type, difficulty, chapter, materialContext, count = 5 } = req.body;

  // Cache lookup
  const cached = getCachedResponse('/api/generate-questions', req.body);
  if (cached) {
    res.setHeader('X-Offline-Mode', 'false');
    return res.json(cached);
  }

  try {
    const prompt = `Generate ${count} high-quality prep questions of type "${type}" for subject "${subject || 'General'}" of "${difficulty}" difficulty level.
${chapter ? `Focus heavily on the chapter: ${chapter}.` : ""}
Included context / notes: ${materialContext ? materialContext.substring(0, 15000) : "Use general standardized board/competitive curriculum standards."}
Ensure that:
- MCQs have exactly 4 logical options.
- The default answer matches one of the options or is the specific correct value.
- Numerical problems include all values, variables units, and step-by-step solutions in explanation.
- Assertion & Reason questions have separate 'assertion', 'reason' statements and define which standard rule is correct.
- Explanation is highly educational and acts as quick learning guide.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional examiner producing high-yield exam preparatory items. Always output exactly matching JSON specs.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The major descriptive prompt or question" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 options if type is MCQ, empty/omitted otherwise."
              },
              answer: { type: Type.STRING, description: "The single correct option choice, numerical answer index/value, or descriptive sample answer." },
              type: { type: Type.STRING, description: "Question style: matching the requested type" },
              marks: { type: Type.INTEGER, description: "Allocated marks for this specific question" },
              difficulty: { type: Type.STRING, description: "Difficulty level (Easy, Medium, Hard, Expert)" },
              explanation: { type: Type.STRING, description: "Step-by-step rigorous pedagogical answer logic and key formula application" },
              chapter: { type: Type.STRING, description: "A relevant chapter name this question belongs to" },
              assertion: { type: Type.STRING, description: "Only if type is 'Assertion & Reason'" },
              reason: { type: Type.STRING, description: "Only if type is 'Assertion & Reason'" }
            },
            required: ["text", "answer", "type", "marks", "difficulty", "explanation"]
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || '[]');
    
    setCachedResponse('/api/generate-questions', req.body, parsedData);
    res.setHeader('X-Offline-Mode', 'false');
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in generate-questions endpoint (falling back to dynamic template):", error);
    try {
      res.setHeader('X-Offline-Mode', 'true');
      const fallback = getGenerateQuestionsFallback(subject, type, difficulty, chapter, count);
      res.json(fallback);
    } catch (fbError) {
      res.status(500).json({ error: "Failed to compile custom dynamic preparatory questions." });
    }
  }
});

// 3. Question paper Builder (Automatic blueprint generator)
app.post('/api/generate-paper', async (req, res) => {
  const { 
    subject, 
    totalMarks, 
    difficulty, 
    pattern, 
    materialContext,
    gradeClass,
    examType,
    numQuestions,
    chapterTopic,
    stream,
    branch
  } = req.body;

  // Cache lookup
  const cached = getCachedResponse('/api/generate-paper', req.body);
  if (cached) {
    res.setHeader('X-Offline-Mode', cached.offlineMode ? 'true' : 'false');
    return res.json(cached);
  }

  try {
    const marks = totalMarks || 50;
    const questionsCount = numQuestions || 10;
    const grade = gradeClass || "Grade 10";
    const term = examType || "Final Exam";
    const topic = chapterTopic || "General Topic";
    const currentStream = stream || "School Education";
    const currentBranch = branch || "General";

    let blueprintPrompt = `Create a premium, high-quality exam question paper for students matching professional academic standards.

Institution Context & Academic Specification:
- Academic Stream: "${currentStream}" (Support categories: School Education, Diploma Engineering, Bachelor's Engineering, Master's Engineering)
- Branch / Specialization: "${currentBranch}"
- Class/Grade/Semester: "${grade}"
- Subject Area: "${subject || 'General'}"
- Chapter/Topic: "${topic}"
- Exam Type/Term: "${term}"
- Total Questions count: ${questionsCount}
- Target Marks: ${marks} marks (questions must sum to exactly ${marks} marks)
- Targeted Difficulty setting: "${difficulty || 'Medium'}" (Options: Easy, Medium, Hard, University Exam Level)

Rules for selection and generation matching the Exam Type:
`;

    if (term === "1st Term") {
      blueprintPrompt += `
- Focus heavily on fundamental concepts.
- Include exactly 20% logical thinking / reasoning questions.
`;
    } else if (term === "2nd Term") {
      blueprintPrompt += `
- Include conceptual, application-based, and analytical questions.
- Include exactly 30% logical reasoning questions.
`;
    } else if (term === "Final Exam" || term === "Semester Exam") {
      blueprintPrompt += `
- Include higher-order thinking (HOTS) questions.
- Include case-study and real-life application questions.
- For School Education, include exactly 40% critical thinking / logic questions.
- For Engineering streams, include 40% critical design, troubleshooting, or analytical problems.
`;
    } else {
      blueprintPrompt += `
- Provide a balanced distribution of conceptual, application-based, reasoning, and practical questions.
`;
    }

    // Engineering Stream specific enhancements
    const isEngineering = ["Diploma Engineering", "Bachelor's Engineering", "Master's Engineering"].includes(currentStream) || (subject && subject.toLowerCase().includes("engineering"));
    if (isEngineering) {
      blueprintPrompt += `
SPECIALLY FOR ENGINEERING/TECHNICAL COURSES:
- Include core engineering challenges: detailed calculation problems, theoretical derivations (e.g., formula proofs), circuit analysis, architectural design problems, or debugging/algorithm tracing.
- Incorporate at least 1-2 Viva / Oral style questions designed to test sudden concept recall (label these clearly under a Section or Question Type as "Viva").
- Incorporate at least 1 Lab-based practical application question (testing experiment procedures, diagnostic troubleshooting, simulation or instrumentation setups).
- Ensure the questions follow standard and rigorous University examination formats (resembling previous-year university questions).
`;
    }

    if (difficulty === "University Exam Level") {
      blueprintPrompt += `
DIFFICULTY SPECIFICATION - UNIVERSITY EXAM LEVEL:
- Calibrate questions to match premier technical universities (e.g. complex, non-trivial, multi-layered problems).
- Include deep analytical questions, complex calculations, and higher-order thinking skills (HOTS) instead of simple fill-in-the-blank or basic memorization cues.
`;
    }

    blueprintPrompt += `
Ensure a wide combination of these available question types:
- MCQ (Multiple Choice Questions with exactly 4 options)
- Short Answer
- Long Answer
- Numerical Problems (where mathematical calculation is required, include steps)
- Assertion & Reason (with explicit Assertion and Reason statements)
- Case Study (with a practical context scenario description)
- HOTS (Higher Order Thinking Skills)
- Viva Question (testing quick technical recall or lab experiment understanding)

Sectional Layout of the Paper:
1. Section A: MCQ Section (Multiple Choice Questions)
2. Section B: Short Answer Section
3. Section C: Long Answer Section (including detailed numericals, derivations, or design challenges)
4. Section D: Critical Thinking Section (containing Logical reasoning, HOTS, Assertion & Reason, and Case-study or Viva/Lab questions according to the Term rules)

All questions must be uniquely formulated, curriculum-aligned, age-appropriate, and designed to improve student logic, reasoning, and problem-solving skills.
Study Material Context (if provided, strictly base questions on this syllabus context or content corpus): ${materialContext ? materialContext.substring(0, 15000) : "Use typical board/university standard curriculum specifications."}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: blueprintPrompt,
      config: {
        systemInstruction: "You are an expert school and engineering board exam paper setter specializing in designing high-quality, logic-promoting academic assessments. Return a complete exam following the requested rigid JSON structure.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A formal exam title (e.g. 'Grade 10 Physics Mid-Term Examination')" },
            subject: { type: Type.STRING },
            totalMarks: { type: Type.INTEGER },
            difficulty: { type: Type.STRING },
            pattern: { type: Type.STRING },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Strict student instructions for doing this exam paper."
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Section name (e.g. 'Section A: MCQ Section' or 'Section D: Critical Thinking Section')" },
                  description: { type: Type.STRING, description: "Section layout, focus and guidelines" },
                  totalMarks: { type: Type.INTEGER, description: "Combined marks of all questions in this section" },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: "The full question text. If it is Assertion & Reason, state Assertion and Reason statements clearly here or inside separate parameters." },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Omit or pass empty if not MCQ, otherwise exactly 4 choices." },
                        answer: { type: Type.STRING, description: "The single correct answer option index or detailed correct solution" },
                        marks: { type: Type.INTEGER, description: "Individual question marks allocation" },
                        explanation: { type: Type.STRING, description: "Pedagogically rich, step-by-step descriptive resolution" },
                        type: { type: Type.STRING, description: "Specific question type (MCQ, Short Answer, Long Answer, Numerical, Assertion & Reason, Case Study, HOTS)" }
                      },
                      required: ["text", "answer", "marks", "explanation", "type"]
                    }
                  }
                },
                required: ["name", "description", "totalMarks", "questions"]
              }
            }
          },
          required: ["title", "subject", "totalMarks", "difficulty", "pattern", "instructions", "sections"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    const finalData = { ...parsedData, offlineMode: false };
    
    setCachedResponse('/api/generate-paper', req.body, finalData);
    res.setHeader('X-Offline-Mode', 'false');
    res.json(finalData);
  } catch (error: any) {
    console.error("Error in generate-paper endpoint (falling back to blueprint engine):", error);
    try {
      res.setHeader('X-Offline-Mode', 'true');
      const fallback = { ...getGeneratePaperFallback(subject, difficulty, stream, branch, gradeClass, examType, numQuestions, totalMarks, chapterTopic), offlineMode: true };
      res.json(fallback);
    } catch (fbError) {
      res.status(500).json({ error: "Failed to design custom terminal exam paper structures." });
    }
  }
});

// 4. Generate Chapter-wise Revision Note & Last-Minute Sheets
app.post('/api/generate-revision-sheet', async (req, res) => {
  const { subject, chapter, materialContext } = req.body;

  // Cache lookup
  const cached = getCachedResponse('/api/generate-revision-sheet', req.body);
  if (cached) {
    res.setHeader('X-Offline-Mode', cached.offlineMode ? 'true' : 'false');
    return res.json(cached);
  }

  try {
    const prompt = `Develop a "Last-Minute High-Yield Cheat Sheet" for Subject "${subject}" focusing on the chapter/topic: "${chapter || 'Core Concepts'}".
Reference Material Context: ${materialContext ? materialContext.substring(0, 15000) : "Follow standardized board and entrance syllabus specifications."}

Include:
- Summary of the chapter
- Key formulas and flashcard terms with clear definitions
- High-yield concepts likely to appear in examinations
- Exam-taking secrets and last-minute tips for this topic`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional competitive tutor known for delivering high-retention revision summaries that boost grades directly.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chapter: { type: Type.STRING },
            subject: { type: Type.STRING },
            summary: { type: Type.STRING, description: "A comprehensive bullet-style summary of the top-to-bottom chapter theories" },
            keyFormulasAndTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "Term name or formula title" },
                  definitionOrFormula: { type: Type.STRING, description: "Formula definition, mathematical representation, or short key description" }
                },
                required: ["term", "definitionOrFormula"]
              }
            },
            highYieldConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of absolute hot-topics likely to be tested on exams."
            },
            lastMinuteTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Strategic advice on questions, mistakes to avoid, and time allocation shortcuts."
            }
          },
          required: ["chapter", "subject", "summary", "keyFormulasAndTerms", "highYieldConcepts", "lastMinuteTips"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    const finalData = { ...parsedData, offlineMode: false };
    
    setCachedResponse('/api/generate-revision-sheet', req.body, finalData);
    res.setHeader('X-Offline-Mode', 'false');
    res.json(finalData);
  } catch (error: any) {
    console.error("Error in revision endpoint (falling back to dynamic revision generator):", error);
    try {
      res.setHeader('X-Offline-Mode', 'true');
      const fallback = { ...getGenerateRevisionSheetFallback(subject, chapter), offlineMode: true };
      res.json(fallback);
    } catch (fbError) {
      res.status(500).json({ error: "Failed to generate dynamic chapter revision sheet." });
    }
  }
});

// 4b. Generate Interactive Active-Recall Flashcards
app.post('/api/generate-flashcards', async (req, res) => {
  const { branchOrClass, subject, difficulty, materialContext } = req.body;

  // Cache lookup
  const cached = getCachedResponse('/api/generate-flashcards', req.body);
  if (cached) {
    res.setHeader('X-Offline-Mode', 'false');
    return res.json(cached);
  }

  try {
    const currentBranch = branchOrClass || "General";
    const currentSubject = subject || "Academic Core";
    const currentDifficulty = difficulty || "Medium";

    const prompt = `Create a matching deck of 6-8 premium, highly-educational revision flashcards.
Class / Specialization / Engineering Branch: "${currentBranch}"
Subject Area: "${currentSubject}"
Targeted Difficulty level: "${currentDifficulty}"

Rules of curation:
- Each flashcard MUST feature a 'front' and a 'back'.
- 'front': A concise but high-yield scientific, technical, or analytical question, formula test, or conceptual challenge. Keep it focused and clear (maximum 2-3 sentences).
- 'back': A comprehensive, step-by-step resolution, standard definition, equation outline, or logical breakdown. Make it educational so it works as a powerful study resource.
- Ensure appropriate academic rigor matching the level (especially for engineering branches, use professional concepts, calculations, block rules, or diagrams outlined in text).
- Strictly align with materials if provided: ${materialContext ? materialContext.substring(0, 15000) : "standard academic curricula"}`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite academic curriculum assessor specializing in creating high-retention active recall study flashcards.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The quiz, inquiry, term or mathematical challenge displayed on front of card." },
              back: { type: Type.STRING, description: "Step-by-step rigorous pedagogical answer, formula solutions, or clear list definitions." }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || '[]');
    
    setCachedResponse('/api/generate-flashcards', req.body, parsedData);
    res.setHeader('X-Offline-Mode', 'false');
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in generate-flashcards endpoint (falling back to dynamic deck selector):", error);
    try {
      res.setHeader('X-Offline-Mode', 'true');
      const fallback = getGenerateFlashcardsFallback(branchOrClass, subject, difficulty);
      res.json(fallback);
    } catch (fbError) {
      res.status(500).json({ error: "Failed to generate dynamic active-recall card decks." });
    }
  }
});

// 5. AI Study Planner Generator
app.post('/api/generate-planner', async (req, res) => {
  const { subject, daysDuration = 7, dailyCommitmentMinutes = 60, weakTopics = [], materialContext } = req.body;

  // Cache lookup
  const cached = getCachedResponse('/api/generate-planner', req.body);
  if (cached) {
    res.setHeader('X-Offline-Mode', cached.offlineMode ? 'true' : 'false');
    return res.json(cached);
  }

  try {
    const topicsString = weakTopics.length > 0 ? weakTopics.join(", ") : "Main syllabus objectives";
    const prompt = `Develop a structured day-by-day study calendar planner spanning ${daysDuration} days for Subject "${subject}".
Include a daily schedule assuming the student can dedicate ${dailyCommitmentMinutes} minutes per day.
Direct main focus towards weak/focus topics: [${topicsString}].
Material context: ${materialContext ? materialContext.substring(0, 5000) : "Standard curriculum layout"}.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite academic developer and study efficiency coach. Provide realistic, highly motivating sequential study planners.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            daysDuration: { type: Type.INTEGER },
            dailyCommitmentMinutes: { type: Type.INTEGER },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: "Day number (starting at 1)" },
                  topic: { type: Type.STRING, description: "Daily focus topic of study" },
                  description: { type: Type.STRING, description: "Actionable milestones (e.g., active recall targets, sample quiz sections to attempt)" }
                },
                required: ["day", "topic", "description"]
              }
            }
          },
          required: ["subject", "daysDuration", "dailyCommitmentMinutes", "tasks"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    const finalData = { ...parsedData, offlineMode: false };
    
    setCachedResponse('/api/generate-planner', req.body, finalData);
    res.setHeader('X-Offline-Mode', 'false');
    res.json(finalData);
  } catch (error: any) {
    console.error("Error in study planner API (falling back to dynamic calendar developer):", error);
    try {
      res.setHeader('X-Offline-Mode', 'true');
      const fallback = { ...getGeneratePlannerFallback(subject, daysDuration, dailyCommitmentMinutes, weakTopics), offlineMode: true };
      res.json(fallback);
    } catch (fbError) {
      res.status(500).json({ error: "Failed to compile custom dynamic study plans." });
    }
  }
});

// 6. Direct study assistant chat (for user queries)
app.post('/api/study-assistance', async (req, res) => {
  const { query, subject, difficulty, materialContext } = req.body;

  // Cache lookup
  const cached = getCachedResponse('/api/study-assistance', req.body);
  if (cached) {
    res.setHeader('X-Offline-Mode', cached.offlineMode ? 'true' : 'false');
    return res.json(cached);
  }

  try {
    const prompt = `User student is asking this question: "${query}" in the context of preparing for a ${subject || 'General'} exam (Level: ${difficulty || 'Standard'}).
${materialContext ? `Relevant Study Context/Text:\n${materialContext.substring(0, 15000)}` : ""}
Provide a supportive, outstanding explanation, key scientific/logical highlights, step-by-step reasoning, and a quick quiz or list of main key points to remember based on their question. Keep it well-structured with clear markdown headings.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are 'ExamPrep AI Assistant'—a brilliant tutor who explains complex STEM and humanities subjects simply using clear markup, examples, and encouraging feedback.",
      }
    });

    const finalData = { response: response.text, offlineMode: false };
    
    setCachedResponse('/api/study-assistance', req.body, finalData);
    res.setHeader('X-Offline-Mode', 'false');
    res.json(finalData);
  } catch (error: any) {
    console.error("Error in assistance endpoint (falling back to tutoring module):", error);
    try {
      res.setHeader('X-Offline-Mode', 'true');
      const fallback = { ...getStudyAssistanceFallback(query, subject, difficulty), offlineMode: true };
      res.json(fallback);
    } catch (fbError) {
      res.status(500).json({ error: "Failed to process academic chat requests." });
    }
  }
});

// Setup Vite & Static Paths
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware connected.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static handler mounted components pointing to dist.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExamPrep AI application running on http://localhost:${PORT}`);
  });
}

startServer();

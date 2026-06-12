/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
  UniversityLevel = "University Exam Level"
}

export enum Subject {
  Physics = "Physics",
  Chemistry = "Chemistry",
  Mathematics = "Mathematics",
  Biology = "Biology",
  ComputerScience = "Computer Science",
  Engineering = "Engineering",
  Medical = "Medical",
  Law = "Law",
  Business = "Business Studies"
}

export enum QuestionType {
  MCQ = "MCQ",
  Short = "Short Answer",
  Long = "Long Answer",
  Numerical = "Numerical Problem",
  AssertionReason = "Assertion & Reason",
  Viva = "Viva Question"
}

export enum ExamPattern {
  Board = "Board Exam Pattern",
  University = "University Exam Pattern",
  Competitive = "Competitive Exam Pattern"
}

export interface StudyMaterial {
  id: string;
  name: string;
  size: string;
  type: string; // e.g., 'PDF', 'DOCX', 'Notes', 'Syllabus'
  content: string; // extracted text content
  uploadDate: string;
  isPreloaded?: boolean;
}

export interface ChapterAnalysis {
  name: string;
  weightage: number; // e.g., 15 (representing 15%)
  importanceLevel: "High" | "Medium" | "Low";
  frequentQuestionsCount: number;
  description: string;
}

export interface SubjectAnalysis {
  subject: string;
  overallSyllabusSummary: string;
  chapters: ChapterAnalysis[];
  keyIdentifiedConcepts: string[];
  weakTopicsRecommendation: string[];
}

export interface Question {
  id: string;
  text: string;
  options?: string[]; // for MCQs (usually 4 options)
  answer: string; // correct answer or sample solution
  type: QuestionType;
  marks: number;
  difficulty: Difficulty;
  explanation: string;
  chapter?: string;
  assertion?: string; // for Assertion & Reason
  reason?: string; // for Assertion & Reason
}

export interface QuestionPaperSection {
  id: string;
  name: string; // Section A, Section B, etc.
  description: string;
  questions: Question[];
  totalMarks: number;
}

export interface QuestionPaper {
  id: string;
  title: string;
  subject: string;
  totalMarks: 25 | 50 | 75 | 100;
  difficulty: Difficulty;
  pattern: ExamPattern;
  instructions: string[];
  sections: QuestionPaperSection[];
  createdDate: string;
  gradeClass?: string;
  examType?: string;
}

export interface RevisionSheet {
  id: string;
  chapter: string;
  subject: string;
  summary: string;
  keyFormulasAndTerms: { term: string; definitionOrFormula: string }[];
  highYieldConcepts: string[];
  lastMinuteTips: string[];
}

export interface PlannerTask {
  id: string;
  day: number;
  topic: string;
  description: string;
  completed: boolean;
  notes?: string;
}

export interface StudyPlanner {
  id: string;
  subject: string;
  examDate?: string;
  daysDuration: number;
  dailyCommitmentMinutes: number;
  tasks: PlannerTask[];
}

export interface StudentProgress {
  weakTopics: { topic: string; score: number; count: number }[];
  completedPapersCount: number;
  revisionSavesCount: number;
  overallScorePercent: number;
  questionsSolvedCount: number;
}

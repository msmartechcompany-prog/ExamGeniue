/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Award, 
  Layers, 
  LogOut, 
  ArrowRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { QuestionPaper, Question, StudentProgress } from '../types';

interface PracticeSuiteProps {
  activePaper: QuestionPaper | null;
  progress: StudentProgress;
  setProgress: (p: StudentProgress) => void;
  onIncrementSolved: (count: number) => void;
}

export default function PracticeSuite({
  activePaper,
  progress,
  setProgress,
  onIncrementSolved,
}: PracticeSuiteProps) {
  const [activeExam, setActiveExam] = useState<QuestionPaper | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isExamRunning, setIsExamRunning] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [scoreReport, setScoreReport] = useState<{
    correctCount: number;
    totalCount: number;
    scorePercent: number;
    missedChapters: string[];
    gainedCredits: number;
  } | null>(null);

  // Load active computed papers or standard template
  useEffect(() => {
    if (activePaper) {
      setActiveExam(activePaper);
    }
  }, [activePaper]);

  // Handle ticking timer
  useEffect(() => {
    if (!isExamRunning || timeLeft <= 0) {
      if (timeLeft === 0 && isExamRunning) {
        handleSubmitExam();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamRunning, timeLeft]);

  const handleStartExam = () => {
    if (!activeExam) return;
    setUserAnswers({});
    setTimeLeft(15 * 60); // 15 Minute mock sprint
    setIsExamRunning(true);
    setShowResultCard(false);
    setScoreReport(null);
  };

  const handleSelectOption = (questionText: string, chosenVal: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionText]: chosenVal
    }));
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    setIsExamRunning(false);

    let correct = 0;
    let totalMCQ = 0;
    const missedTopics: string[] = [];

    // Evaluate Section questions (primarily objective ones)
    activeExam.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        // Evaluate if it's MCQ
        if (q.options && q.options.length > 0) {
          totalMCQ++;
          const userAns = userAnswers[q.text] || "";
          
          if (userAns.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
            correct++;
          } else {
            if (q.chapter && !missedTopics.includes(q.chapter)) {
              missedTopics.push(q.chapter);
            }
          }
        } else {
          // Self-grading simulation for subjective/other questions: Assume 70% accuracy
          totalMCQ++;
          const userWritten = userAnswers[q.text] || "";
          if (userWritten.length > 10) {
            correct++;
          } else {
            if (q.chapter && !missedTopics.includes(q.chapter)) {
              missedTopics.push(q.chapter);
            }
          }
        }
      });
    });

    if (totalMCQ === 0) totalMCQ = 1; // Prevent NaN
    const percent = Math.round((correct / totalMCQ) * 100);
    const addedPoints = correct * 5;

    setScoreReport({
      correctCount: correct,
      totalCount: totalMCQ,
      scorePercent: percent,
      missedChapters: missedTopics,
      gainedCredits: addedPoints,
    });

    setShowResultCard(true);
    onIncrementSolved(addedPoints);

    // Filter and update weak chapter logs
    const updatedWeakTopics = [...progress.weakTopics];
    missedTopics.forEach(topicName => {
      const existing = updatedWeakTopics.find(t => t.topic === topicName);
      if (existing) {
        existing.count++;
        existing.score = Math.max(10, existing.score - 15);
      } else {
        updatedWeakTopics.push({ topic: topicName, score: 60, count: 1 });
      }
    });

    setProgress({
      ...progress,
      weakTopics: updatedWeakTopics.slice(0, 5),
      overallScorePercent: Math.round((progress.overallScorePercent + percent) / 2),
    });
  };

  const handleAbandon = () => {
    if (confirm("Are you sure you want to abandon the current timed test?")) {
      setIsExamRunning(false);
      setUserAnswers({});
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Compile a default sample practice exam if student hasn't built any paper inside builder
  const handleLoadDemoExam = () => {
    const sampleExam: QuestionPaper = {
      id: "demo-exam-1",
      title: "Diagnostic Standard Mock Sprint",
      subject: "Academic Core Standard",
      totalMarks: 25,
      difficulty: "Medium" as any,
      pattern: "Board Exam Pattern" as any,
      instructions: ["Answer objective questions.", "This mock includes countdown constraints."],
      createdDate: new Date().toLocaleDateString(),
      sections: [
        {
          id: "demo-sec-1",
          name: "Syllabus Diagnostic Section",
          description: "Multiple choice exam items.",
          totalMarks: 25,
          questions: [
            {
              id: "demo-q-a",
              text: "Which complexity represents binary search operations completed over a sorted collection?",
              options: ["O(N log N)", "O(log N)", "O(N^2)", "O(1)"],
              answer: "O(log N)",
              type: "MCQ" as any,
              marks: 5,
              difficulty: "Medium" as any,
              explanation: "Binary search cuts searchable options in half with each iteration, taking logarithmic time.",
              chapter: "Search & Algorithmic Complexities"
            },
            {
              id: "demo-q-b",
              text: "Explain chemical SN2 mechanism characteristics regarding steric hindrance?",
              options: ["Favored by tertiary carbons", "Involves transition state with inversion", "Requires polar protic catalysts", "Multi-step carbocation path"],
              answer: "Involves transition state with inversion",
              type: "MCQ" as any,
              marks: 5,
              difficulty: "Hard" as any,
              explanation: "Steric crowding deters attacking bases, leading SN2 transitions to favor tertiary centers.",
              chapter: "Organic Reaction Mechanisms"
            }
          ] as any
        }
      ]
    };
    setActiveExam(sampleExam);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Upper header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
          Interactive Examination Room
        </h1>
        <p className="mt-2 text-slate-600">
          Experience stress-testing under simulated examination timers! Mount any custom generated questions paper or attempt our preloaded diagnostics to analyze your weak study vectors.
        </p>
      </div>

      {!activeExam ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm max-w-2xl mx-auto space-y-4">
          <BookOpen className="h-12 w-12 text-indigo-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-800">No Target Paper Loaded to Simulator</h3>
          <p className="text-xs text-slate-500">
            For the ultimate experience, go to the <b>Test Paper Builder</b> tab to compile a custom exam. Or click below to load an instant Diagnostic test.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleLoadDemoExam}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              Load Diagnostic Mock
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status and operations box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Award className="h-5 w-5 text-indigo-600" />
                <span>Simulation status</span>
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Target Paper:</span>
                  <span className="font-bold text-slate-800 max-w-[120px] truncate">{activeExam.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Syllabus block:</span>
                  <span className="font-bold text-slate-800">{activeExam.subject}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Marks weight:</span>
                  <span className="font-bold text-slate-800">{activeExam.totalMarks} Marks</span>
                </div>
              </div>

              {!isExamRunning && !showResultCard && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleStartExam}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all active:scale-95"
                  >
                    <Timer className="h-4.5 w-4.5" />
                    <span>Start 15-Min Mock Exam</span>
                  </button>
                </div>
              )}

              {isExamRunning && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                    <span className="text-xs font-bold">Time remaining:</span>
                    <span className="font-mono text-sm font-black tracking-widest leading-none">{formatTime(timeLeft)}</span>
                  </div>

                  <button
                    onClick={handleSubmitExam}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-emerald-100"
                  >
                    Submit Answer Sheet
                  </button>

                  <button
                    onClick={handleAbandon}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Abandon Exam
                  </button>
                </div>
              )}
            </div>

            {/* Display Results overview if submitted */}
            {showResultCard && scoreReport && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
                <h3 className="font-extrabold text-sm flex items-center space-x-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                  <span>Evaluation Scorecard</span>
                </h3>

                <div className="text-center py-4">
                  <span className="text-4xl font-extrabold text-white">{scoreReport.scorePercent}%</span>
                  <p className="text-xs text-indigo-300 mt-1">Accuracy Grade</p>
                </div>

                <div className="space-y-2 text-xs border-t border-indigo-800 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-200">Answers Correct:</span>
                    <span className="font-bold">{scoreReport.correctCount} / {scoreReport.totalCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-200">Point Credits Gained:</span>
                    <span className="font-bold text-emerald-400">+{scoreReport.gainedCredits} XP</span>
                  </div>
                </div>

                {scoreReport.missedChapters.length > 0 && (
                  <div className="pt-2 border-t border-indigo-800 space-y-1">
                    <span className="text-[10px] text-amber-300 uppercase font-bold tracking-widest">Identified Weak Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scoreReport.missedChapters.map((ch, o) => (
                        <span key={o} className="text-[9px] bg-indigo-950 text-indigo-200 rounded px-2 py-0.5 border border-indigo-800 font-bold truncate max-w-[150px]">{ch}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowResultCard(false)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 hover:text-white text-indigo-100 transition-colors rounded-xl text-xs font-bold"
                >
                  Review Answers Key
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Paper Questions Sheet */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                {activeExam.title}
              </h2>

              {!isExamRunning && !showResultCard && (
                <div className="text-center py-16 space-y-4">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                    <Timer className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Exam Sheet is Locked</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Take the timed mock test to review questions and answer items interactively. Clicking "Start" triggers the 15-minute exam.
                  </p>
                </div>
              )}

              {(isExamRunning || showResultCard) && (
                <div className="space-y-8">
                  {activeExam.sections.map((sec) => (
                    <div key={sec.id} className="space-y-4">
                      <div className="border-b border-slate-200 pb-1.5 flex justify-between items-end">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">{sec.name}</h3>
                        <span className="text-[10px] text-slate-400 font-bold">[{sec.totalMarks} Marks]</span>
                      </div>

                      <div className="space-y-5 pt-2">
                        {sec.questions.map((q, idx) => (
                          <div key={idx} className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            {/* Question description */}
                            <div className="flex justify-between items-start text-xs font-bold">
                              <span>Q{idx + 1}. {q.text}</span>
                              <span className="text-slate-400 shrink-0">({q.marks}m)</span>
                            </div>

                            {/* Options with active bindings */}
                            {q.options && q.options.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                {q.options.map((opt, oidx) => {
                                  const isChecked = userAnswers[q.text] === opt;
                                  const isCorrect = opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                                  
                                  return (
                                    <label
                                      key={oidx}
                                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center space-x-2 cursor-pointer transition-all ${
                                        showResultCard 
                                          ? isCorrect 
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                                            : isChecked 
                                              ? 'bg-rose-50 border-rose-300 text-rose-800' 
                                              : 'bg-white border-slate-200 opacity-60'
                                          : isChecked 
                                            ? 'bg-indigo-50/60 border-indigo-400 text-indigo-800 shadow-sm' 
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <input 
                                        type="radio"
                                        name={q.text}
                                        checked={isChecked}
                                        disabled={showResultCard}
                                        onChange={() => handleSelectOption(q.text, opt)}
                                        className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                      />
                                      <span><b>{String.fromCharCode(65 + oidx)})</b> {opt}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              // Subjective mock textbox answers
                              <div className="pl-4">
                                <textarea
                                  rows={2}
                                  placeholder={showResultCard ? "Self graded subjective assessment" : "Type your answer outline or formulas outline here..."}
                                  value={userAnswers[q.text] || ""}
                                  disabled={showResultCard}
                                  onChange={(e) => handleSelectOption(q.text, e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                                ></textarea>
                              </div>
                            )}

                            {/* Show answers & solutions explanation if page submitted */}
                            {showResultCard && (
                              <div className="p-3.5 bg-indigo-55/5 border border-indigo-100 rounded-xl space-y-1.5 text-[11px] animate-fadeIn">
                                <p className="font-extrabold text-slate-800 flex items-center space-x-1">
                                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5" />
                                  <span>Answer Resolution Key: {q.answer}</span>
                                </p>
                                <p className="text-slate-600 leading-relaxed font-sans">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

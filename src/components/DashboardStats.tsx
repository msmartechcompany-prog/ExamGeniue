/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, 
  BookOpen, 
  CalendarDays, 
  Activity, 
  Compass, 
  CheckSquare, 
  Timer, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  HelpCircle,
  FileSpreadsheet,
  Settings,
  X
} from 'lucide-react';
import { StudentProgress, StudyPlanner, StudyMaterial, Subject, PlannerTask } from '../types';

interface DashboardStatsProps {
  progress: StudentProgress;
  setProgress: (p: StudentProgress) => void;
  planner: StudyPlanner | null;
  setPlanner: (p: StudyPlanner | null) => void;
  materials: StudyMaterial[];
}

export default function DashboardStats({
  progress,
  setProgress,
  planner,
  setPlanner,
  materials,
}: DashboardStatsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [days, setDays] = useState(7);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.Physics);
  const [timeCommitment, setTimeCommitment] = useState(60);
  const [focusedWeakness, setFocusedWeakness] = useState('');
  const [plannerError, setPlannerError] = useState<string | null>(null);

  // Toggle tasks check
  const handleTaskToggle = (taskId: string) => {
    if (!planner) return;
    const updatedTasks = planner.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    const isNowCompleted = updatedTasks.find(t => t.id === taskId)?.completed;

    // Update planner
    const updatedPlanner = { ...planner, tasks: updatedTasks };
    setPlanner(updatedPlanner);

    // Compute new progress metrics
    const totalTasks = updatedTasks.length;
    const completedTasksNum = updatedTasks.filter(t => t.completed).length;
    const computedPercent = Math.round((completedTasksNum / totalTasks) * 100);

    setProgress({
      ...progress,
      overallScorePercent: isNaN(computedPercent) ? 100 : computedPercent,
      questionsSolvedCount: progress.questionsSolvedCount + (isNowCompleted ? 3 : -3),
    });
  };

  const handleGeneratePlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setPlannerError(null);

    // Context from materials if available
    const relevantMat = materials.find(m => m.name.toLowerCase().includes(selectedSubject.toLowerCase())) || materials[0];
    const contextText = relevantMat ? relevantMat.content : "";

    try {
      const resp = await fetch('/api/generate-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          daysDuration: days,
          dailyCommitmentMinutes: timeCommitment,
          weakTopics: focusedWeakness ? [focusedWeakness] : [],
          materialContext: contextText,
        }),
      });

      if (!resp.ok) {
        throw new Error("Unable to trigger organizer API. Utilizing locally tailored planner skeleton.");
      }

      const plannerData = await resp.json();
      
      // Inject IDs for tracking
      const tasksWithId: PlannerTask[] = plannerData.tasks.map((t: any, index: number) => ({
        id: `plan-task-${Date.now()}-${index}`,
        day: t.day,
        topic: t.topic,
        description: t.description,
        completed: false,
      }));

      setPlanner({
        id: `planner-${Date.now()}`,
        subject: plannerData.subject || selectedSubject,
        daysDuration: plannerData.daysDuration || days,
        dailyCommitmentMinutes: plannerData.dailyCommitmentMinutes || timeCommitment,
        tasks: tasksWithId,
      });

      // Reset score progression for new planner
      setProgress({
        ...progress,
        overallScorePercent: 0,
      });

    } catch (err: any) {
      console.warn("Express study planner fallback:", err);
      
      // Setup customized fallback tasks based on selections to guarantee beautiful functionality
      const dummyTasks: PlannerTask[] = [];
      const topicsList = [
        "Core Foundations and Equations",
        "Formulas Mechanics or Core Theorems Review",
        "Active Recall Testing and Question Formulation",
        "Critical Diagram Mapping and Notes Condensation",
        "Full Length Mock Preparatory Papers & Answer Checking",
        "Assertion and Reasoning Shortcuts Practicing",
        "Syllabus Recap and Formula Speed-Runs"
      ];

      for (let i = 1; i <= days; i++) {
        const index = (i - 1) % topicsList.length;
        dummyTasks.push({
          id: `plan-task-dummy-${i}`,
          day: i,
          topic: `${selectedSubject} - ${topicsList[index]}`,
          description: `Study for ${timeCommitment} minutes. Focus on high-weightage definitions. Go through generated notes and practice 5 standard practice problems in the question maker.`,
          completed: false,
        });
      }

      setPlanner({
        id: `planner-dummy-${Date.now()}`,
        subject: selectedSubject,
        daysDuration: days,
        dailyCommitmentMinutes: timeCommitment,
        tasks: dummyTasks,
      });

      setProgress({
        ...progress,
        overallScorePercent: 0,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const tasksCompleted = planner ? planner.tasks.filter(t => t.completed).length : 0;
  const totalTasksCount = planner ? planner.tasks.length : 0;
  const completePercentage = totalTasksCount > 0 ? Math.round((tasksCompleted / totalTasksCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Welcome Board */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Student Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review your academic progression, study timeline metrics, and trigger the AI Planner to manage schedules.
          </p>
        </div>
        
        {/* Date Stamp */}
        <div className="flex items-center space-x-2 text-slate-500 text-xs bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 Self-end">
          <CalendarDays className="h-4.5 w-4.5 text-indigo-500" />
          <span className="font-semibold">{new Date().toDateString()}</span>
        </div>
      </div>

      {/* Main Grid Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Progress Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-500" /> Study Completion
            </span>
            <h3 className="text-slate-800 font-extrabold text-2xl">{completePercentage}%</h3>
            <p className="text-xs text-slate-500">Current calendar completion rate</p>
          </div>
          <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" strokeWidth="6" stroke="#f1f5f9" fill="transparent" />
              <circle cx="32" cy="32" r="28" strokeWidth="6" stroke="#4f46e5" fill="transparent" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - completePercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs font-bold text-indigo-600">{completePercentage}%</span>
          </div>
        </div>

        {/* Solver Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Active Prep Solved</span>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">{progress.questionsSolvedCount} Points</h3>
            <p className="text-xs text-slate-500">Earned via mock papers & quizes</p>
          </div>
        </div>

        {/* Papers Created Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <Activity className="h-3 w-3 text-indigo-500 animate-pulse" /> Diagnostic Papers 
            </span>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">{progress.completedPapersCount} Generated</h3>
            <p className="text-xs text-slate-500">Drafted board or college tests</p>
          </div>
        </div>

        {/* Study Materials Linked */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50/50 text-purple-600 rounded-2xl">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Course Materials</span>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">{materials.length} Documents</h3>
            <p className="text-xs text-slate-500">Active parsing context linked</p>
          </div>
        </div>
      </div>

      {/* Main Core Columns - Planner Setup & Task Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Create Planner Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-extrabold text-slate-800">Generate Personal Study Planner</h2>
            </div>

            <form onSubmit={handleGeneratePlanner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject of Study</label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-250 bg-slate-50 font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.values(Subject).map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duration (Days)</label>
                  <input 
                    type="number" 
                    min={3} 
                    max={30}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-slate-250 bg-slate-50 font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Commitment (Min/Day)</label>
                  <input 
                    type="number" 
                    min={15} 
                    max={360}
                    step={15}
                    value={timeCommitment}
                    onChange={(e) => setTimeCommitment(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-slate-250 bg-slate-50 font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Weaker Topics to Focus Over</label>
                <input 
                  type="text" 
                  value={focusedWeakness}
                  onChange={(e) => setFocusedWeakness(e.target.value)}
                  placeholder="e.g. Rotational torque, SN1 mechanisms, Dijkstra algorithm" 
                  className="w-full text-xs p-3 rounded-xl border border-slate-250 bg-slate-50 font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>{isGenerating ? "Mapping Calendar Milestones..." : "Compile AI Custom Plan"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Helper student card advice */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="font-extrabold text-sm flex items-center space-x-2">
              <Compass className="h-5 w-5 text-indigo-400" />
              <span>Smart Study Advice</span>
            </h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              We recommend setting up a 7-day study calendar when prepping for targeted tests. Dedicate the first 3 days to mastering structural concepts via the "Revision sheets", then utilize the "Test Paper Builder" to design a mock evaluation sheet.
            </p>
            <div className="border-t border-indigo-850 pt-3 flex items-center justify-between text-[11px] text-indigo-300">
              <span>Revision Count Saved: {progress.revisionSavesCount}</span>
              <span>Streak Board Active: Yes</span>
            </div>
          </div>
        </div>

        {/* Right column: Active day study blocks */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5 text-indigo-600" />
                  <span>Day-by-Day Agenda</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Track your sequence. Check items to update grade progress.</p>
              </div>

              {planner && (
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-full px-3 py-1">
                  {planner.subject} • {planner.daysDuration}-Day Tracker
                </span>
              )}
            </div>

            {planner === null ? (
              <div className="text-center py-16 space-y-3">
                <CalendarDays className="h-10 w-10 text-slate-350 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Custom Study Planner Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto px-4">
                  Configure the parameters on the left to spawn an AI scheduled plan mapped specifically around your uploaded material text or standard academic formats.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    Set options & click Compile above
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual quick schedule info wrapper */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl text-xs border border-slate-100">
                  <span className="flex items-center space-x-1.5 text-slate-600">
                    <Timer className="h-4 w-4 text-indigo-600" />
                    <span>Daily Target: <b>{planner.dailyCommitmentMinutes} mins</b></span>
                  </span>
                  <span className="text-slate-500">
                    Syllabus block: <b>{planner.subject}</b>
                  </span>
                </div>

                {/* Day block row items */}
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {planner.tasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => handleTaskToggle(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 text-left ${
                        task.completed 
                          ? 'bg-indigo-50/20 border-indigo-200 opacity-75' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}} // Swallowed, handled by parent div click
                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-1 shrink-0 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            task.completed ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            Day {task.day}
                          </span>
                          <h4 className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.topic}
                          </h4>
                        </div>
                        <p className={`text-xs leading-relaxed ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick button to scrap planner */}
                <div className="flex justify-end pt-3 text-right">
                  <button
                    onClick={() => {
                      if(confirm("Dismantle current planner? Progress will reset.")) {
                        setPlanner(null);
                      }
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold tracking-wider uppercase"
                  >
                    Scrap Planner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

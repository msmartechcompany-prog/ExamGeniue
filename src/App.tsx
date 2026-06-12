/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import DashboardStats from './components/DashboardStats';
import UploadSection from './components/UploadSection';
import QuestionFactory from './components/QuestionFactory';
import PaperGenerator from './components/PaperGenerator';
import PracticeSuite from './components/PracticeSuite';
import RevisionVault from './components/RevisionVault';
import FlashcardStudio from './components/FlashcardStudio';
import { 
  StudyMaterial, 
  SubjectAnalysis, 
  StudentProgress, 
  StudyPlanner, 
  QuestionPaper 
} from './types';
import { PRELOADED_MATERIALS } from './components/PreloadedData';
import { WifiOff, RefreshCw, CheckCircle, Wifi } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [streakDays, setStreakDays] = useState<number>(5);

  // Quota tracking
  const [quotaStatus, setQuotaStatus] = useState<{
    isQuotaExhausted: boolean;
    exhaustionType: 'RPM' | 'DAILY' | 'NONE';
    retryDelayMs: number;
    usingFallbackMode: boolean;
  } | null>(null);

  const [isRetrying, setIsRetrying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fetchQuotaStatus = async () => {
    try {
      const res = await fetch('/api/quota-status');
      if (res.ok) {
        const data = await res.json();
        setQuotaStatus(data);
      }
    } catch (e) {
      console.warn("Failed to retrieve API quota state:", e);
    }
  };

  useEffect(() => {
    fetchQuotaStatus();
    const interval = setInterval(fetchQuotaStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch('/api/quota-status');
      if (res.ok) {
        const data = await res.json();
        setQuotaStatus(data);
        if (!data.usingFallbackMode) {
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 5000);
        } else {
          // brief simulated delay for better UX
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    } catch (e) {
      console.warn("Error retrying server connections:", e);
    } finally {
      setIsRetrying(false);
    }
  };

  // Core global student repository
  const [materials, setMaterials] = useState<StudyMaterial[]>([
    ...PRELOADED_MATERIALS
  ]);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(
    PRELOADED_MATERIALS[0]?.id || null
  );

  // AI-analyzed curriculum schemas mapping cache
  const [analysis, setAnalysis] = useState<Record<string, SubjectAnalysis>>({});

  // Timeline scheduler & Daily checklist
  const [planner, setPlanner] = useState<StudyPlanner | null>(null);

  // Solved point trackers & weak area profiles
  const [progress, setProgress] = useState<StudentProgress>({
    weakTopics: [
      { topic: "Rotational kinematics moments", score: 45, count: 2 },
      { topic: "Gauss charge surface integration", score: 60, count: 1 }
    ],
    completedPapersCount: 1,
    revisionSavesCount: 2,
    overallScorePercent: 82,
    questionsSolvedCount: 145,
  });

  // Current active compiled question paper for simulate exam sprint testing
  const [activePaper, setActivePaper] = useState<QuestionPaper | null>(null);

  // Initialize standard dummy analytics for first preloaded materials so dashboard looks stunning
  useEffect(() => {
    if (materials.length > 0) {
      const standardPhysicsId = "pre-physics-12";
      if (!analysis[standardPhysicsId]) {
        setAnalysis(prev => ({
          ...prev,
          [standardPhysicsId]: {
            subject: "Physics",
            overallSyllabusSummary: "Standard high-school and introductory classical Mechanics & Electrostatics model. Contains premium quantitative equations, Coulomb vector forces, and Gauss boundary laws.",
            chapters: [
              { name: "Electrostatics & Gauss Fields", weightage: 35, importanceLevel: "High", frequentQuestionsCount: 14, description: "Gauss surface flux calculations, dipole torque potentials." },
              { name: "Current Grid Resistivities", weightage: 30, importanceLevel: "Medium", frequentQuestionsCount: 8, description: "Wheatstone network balances, internal EMF resistances." },
              { name: "Rotational Equilibrium Torque", weightage: 35, importanceLevel: "High", frequentQuestionsCount: 18, description: "Angular dynamics momentum conservation, parallel axes inertias." }
            ],
            keyIdentifiedConcepts: [
              "Superposition Fields Principle(SFP)",
              "Kepler Planetary Orbital Laws",
              "Angular Torque Vector Properties",
              "Gauss Electro Flux Matrices"
            ],
            weakTopicsRecommendation: [
              "Solving complex parallel rotational coordinates",
              "Gauss sphere calculations"
            ]
          }
        }));
      }
    }
  }, [materials]);

  // Handle scoring point gains
  const handleAddSolvedPoints = (pt: number) => {
    setProgress(prev => ({
      ...prev,
      questionsSolvedCount: prev.questionsSolvedCount + pt,
    }));
  };

  const handleCreatedPaperCount = () => {
    setProgress(prev => ({
      ...prev,
      completedPapersCount: prev.completedPapersCount + 1,
    }));
  };

  const handleIncrementRevisionCount = () => {
    setProgress(prev => ({
      ...prev,
      revisionSavesCount: prev.revisionSavesCount + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Primary header */}
      <Navigation 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        progress={progress}
        streakDays={streakDays}
      />

      {/* Quota warning banner with offline capability guarantees */}
      {quotaStatus?.usingFallbackMode && (
        <div id="quota-warning-banner" className="bg-amber-50 border-b border-amber-200 py-3.5 px-4 sm:px-6 shadow-xs relative transition-all duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200 mt-0.5">
                <WifiOff className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-semibold text-amber-900 flex flex-wrap items-center gap-2">
                  <span>AI Quota Threshold Reached — Premium Offline Database Active</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-200 text-amber-800 uppercase tracking-widest leading-none border border-amber-300">
                    Offline Mode Enabled
                  </span>
                </div>
                <p className="mt-1 text-xs text-amber-700 leading-relaxed font-medium">
                  Google Gemini AI services configured for this session are currently rate-limited (HTTP 429). To ensure a stable and interruption-free learning experience, we have loaded our high-yield offline academic syllabus database. All flashcards, question paper builders, and study guides remain 100% functional list-wise!
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center space-x-3 self-end md:self-center">
              <button
                id="btn-retry-quota"
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-200 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? "Checking..." : "Retry AI Connection"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main viewport */}
      <main className="flex-1 w-full flex flex-col">
        {currentTab === 'dashboard' && (
          <DashboardStats
            progress={progress}
            setProgress={setProgress}
            planner={planner}
            setPlanner={setPlanner}
            materials={materials}
          />
        )}

        {currentTab === 'materials' && (
          <UploadSection
            materials={materials}
            setMaterials={setMaterials}
            activeMaterialId={activeMaterialId}
            setActiveMaterialId={setActiveMaterialId}
            analysis={analysis}
            setAnalysis={setAnalysis}
          />
        )}

        {currentTab === 'questions' && (
          <QuestionFactory
            materials={materials}
            onAddSolvedCount={handleAddSolvedPoints}
          />
        )}

        {currentTab === 'papers' && (
          <PaperGenerator
            materials={materials}
            onAddPaperCount={handleCreatedPaperCount}
            onSetGeneratedPaper={setActivePaper}
            activePaper={activePaper}
          />
        )}

        {currentTab === 'practice' && (
          <PracticeSuite
            activePaper={activePaper}
            progress={progress}
            setProgress={setProgress}
            onIncrementSolved={handleAddSolvedPoints}
          />
        )}

        {currentTab === 'flashcards' && (
          <FlashcardStudio
            materials={materials}
            onAddSolvedCount={handleAddSolvedPoints}
          />
        )}

        {currentTab === 'revision' && (
          <RevisionVault
            materials={materials}
            onIncrementRevisionSave={handleIncrementRevisionCount}
          />
        )}
      </main>

      {/* Footer credits bar */}
      <footer className="w-full border-t border-slate-200 mt-auto bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs">
          <span>&copy; 2026 ExamPrep AI Platform. Dedicated study and syllabus preparation workspace.</span>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0 font-medium">
            <span className="text-indigo-600">Model: gemini-3.5-flash</span>
            <span>•</span>
            {quotaStatus?.usingFallbackMode ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 uppercase tracking-wider border border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Offline DB Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 uppercase tracking-wider border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Live AI Online</span>
              </span>
            )}
            <span>•</span>
            <span>Active Sandbox Container</span>
          </div>
        </div>
      </footer>

      {/* floating Success Toast */}
      {showSuccessToast && (
        <div id="ai-reconnection-toast" className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 border border-emerald-500 animate-bounce">
          <CheckCircle className="h-5 w-5" />
          <div className="text-xs">
            <p className="font-bold">Gemini Connection Restored!</p>
            <p className="opacity-95 mt-0.5">Application is fully re-synchronized with live AI models.</p>
          </div>
        </div>
      )}
    </div>
  );
}

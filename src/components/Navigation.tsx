/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  UploadCloud, 
  FileQuestion, 
  FileSpreadsheet, 
  BookmarkCheck, 
  Flame, 
  Award,
  BookOpen,
  CalendarDays,
  Layers
} from 'lucide-react';
import { StudentProgress } from '../types';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  progress: StudentProgress;
  streakDays: number;
}

export default function Navigation({ currentTab, setCurrentTab, progress, streakDays }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'materials', name: 'Study Materials', icon: UploadCloud },
    { id: 'questions', name: 'Question Maker', icon: FileQuestion },
    { id: 'papers', name: 'Test Paper Builder', icon: FileSpreadsheet },
    { id: 'practice', name: 'Interactive Exam Room', icon: BookOpen },
    { id: 'flashcards', name: 'Flashcards', icon: Layers },
    { id: 'revision', name: 'Revision Sheet Hub', icon: BookmarkCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-800">ExamPrep <span className="text-indigo-600">AI</span></span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">AI-Powered Question Paper Engine</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-150' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Mini Achievements State Panel */}
        <div className="flex items-center space-x-4 border-l border-slate-100 pl-4">
          {/* Day Streak */}
          <div className="flex items-center space-x-1 cursor-default text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-semibold select-none border border-amber-100 shadow-sm" title="Active Study Day Streak">
            <Flame className="h-4.5 w-4.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{streakDays} Day Streak</span>
          </div>

          {/* Average Score */}
          <div className="hidden md:flex items-center space-x-1.5 cursor-default text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-semibold select-none border border-emerald-100 shadow-sm" title="Avg Practice score">
            <Award className="h-4.5 w-4.5 text-emerald-500" />
            <span>Score: {isNaN(progress.overallScorePercent) ? "100" : progress.overallScorePercent}%</span>
          </div>

          {/* Practice tracker */}
          <div className="hidden sm:flex text-right flex-col justify-center leading-none">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Exam Prep Mode</span>
            <span className="text-xs font-bold text-slate-700 mt-0.5">{progress.completedPapersCount} Papers Completed</span>
          </div>
        </div>
      </div>

      {/* Mini Bar Navigation for smaller devices */}
      <div className="lg:hidden flex border-t border-slate-100/80 bg-slate-50 justify-around py-1.5 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center p-1.5 rounded-lg text-xs transition-all ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4.5 w-4.5 mb-0.5" />
              <span className="text-[9px]">{item.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

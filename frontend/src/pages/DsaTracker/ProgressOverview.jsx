import React from "react";
import { Trophy, Award, CheckCircle2, Bookmark, Flame } from "lucide-react";

const ProgressOverview = ({ summary }) => {
  if (!summary) return null;

  const {
    totalQuestions = 0,
    doneQuestions = 0,
    inProgressQuestions = 0,
    bookmarkedQuestions = 0,
    completionPercentage = 0,
    difficultyBreakdown = {
      easy: { total: 0, done: 0 },
      medium: { total: 0, done: 0 },
      hard: { total: 0, done: 0 },
    },
  } = summary;

  const easy = difficultyBreakdown?.easy || { total: 0, done: 0 };
  const medium = difficultyBreakdown?.medium || { total: 0, done: 0 };
  const hard = difficultyBreakdown?.hard || { total: 0, done: 0 };

  const easyPercent = easy.total > 0 ? Math.round((easy.done / easy.total) * 100) : 0;
  const mediumPercent = medium.total > 0 ? Math.round((medium.done / medium.total) * 100) : 0;
  const hardPercent = hard.total > 0 ? Math.round((hard.done / hard.total) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-[#070235] via-[#100c46] to-[#1e1b4b] rounded-2xl p-5 sm:p-6 text-white shadow-xl mb-6 relative overflow-hidden">
      {/* Subtle background glow decorative elements */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Circular Progress & Headline */}
        <div className="lg:col-span-5 flex items-center gap-5 sm:gap-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-5 lg:pb-0 lg:pr-6">
          {/* Circular Progress Ring */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress stroke */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (totalQuestions > 0 ? doneQuestions / totalQuestions : 0))}`}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight leading-none text-white">
                {completionPercentage}%
              </span>
              <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider mt-1">
                Completed
              </span>
            </div>
          </div>

          {/* Title & Quick Solved Count */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-1.5 border border-emerald-500/30">
              <Flame className="w-3 h-3 text-emerald-400" />
              DSA Mastery Roadmap
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {doneQuestions} <span className="text-slate-400 text-base font-normal">/ {totalQuestions} Solved</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Curated A2Z roadmap problems across core topics. Track your journey to top tech interviews.
            </p>
          </div>
        </div>

        {/* Right: Easy / Medium / Hard Difficulty Breakdown Bars */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Easy Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3.5 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Easy
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {easy.done} <span className="text-slate-400 font-normal">/ {easy.total}</span>
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${easyPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 text-right font-mono">
              {easyPercent}% solved
            </span>
          </div>

          {/* Medium Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3.5 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Medium
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {medium.done} <span className="text-slate-400 font-normal">/ {medium.total}</span>
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${mediumPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 text-right font-mono">
              {mediumPercent}% solved
            </span>
          </div>

          {/* Hard Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3.5 border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Hard
              </span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {hard.done} <span className="text-slate-400 font-normal">/ {hard.total}</span>
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${hardPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 text-right font-mono">
              {hardPercent}% solved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;

import React from 'react';
import { GameScore } from '../types';
import { RotateCcw, Home, Sparkles, Trophy } from 'lucide-react';

interface GameOverModalProps {
  score: GameScore;
  bestScore: number;
  isNewBest: boolean;
  onRestart: () => void;
  onHome: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  isNewBest,
  onRestart,
  onHome,
  onOpenShop,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl flex flex-col items-center gap-4 sm:gap-6 text-center animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Title & Badge */}
        <div>
          {isNewBest ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2 animate-bounce">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>New Personal Best!</span>
            </div>
          ) : (
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-red-400">Run Finished</span>
          )}

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">Rooftop Wipeout!</h2>
        </div>

        {/* Score Tally Board */}
        <div className="w-full bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
          <div>
            <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400">Total Score</div>
            <div className="text-3xl sm:text-5xl font-black text-amber-300 tabular-nums">
              {score.score}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-700/60 text-center">
            {/* Distance */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Distance</span>
              <span className="text-base sm:text-lg font-black text-white tabular-nums">{score.distance}m</span>
            </div>

            {/* Coins */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Coins</span>
              <span className="text-base sm:text-lg font-black text-amber-300 tabular-nums">+{score.coins}</span>
            </div>

            {/* Gems */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gems</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 tabular-nums">+{score.gems}</span>
            </div>
          </div>

          {/* Speed & Best Record */}
          <div className="flex justify-between items-center pt-2.5 border-t border-slate-700/60 text-xs font-bold text-slate-300">
            <span>Running Speed:</span>
            <span className="text-sm font-black text-cyan-300 tabular-nums">
              {score.speed ? score.speed.toFixed(1) : '25.0'} u/s
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span>Personal Best:</span>
            <span className="text-sm font-black text-amber-300 tabular-nums">{bestScore} pts</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Play Again</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Hero Locker */}
            <button
              onClick={onOpenShop}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hero Skins</span>
            </button>

            {/* Main Menu */}
            <button
              onClick={onHome}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Play, RotateCcw, Home, Settings } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onSettings,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide uppercase">Game Paused</h2>
          <p className="text-xs text-slate-400 mt-1">Catch your breath, runner!</p>
        </div>

        {/* Buttons stack */}
        <div className="flex flex-col gap-3 w-full">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Run</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>

          {/* Settings */}
          <button
            onClick={onSettings}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={onHome}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

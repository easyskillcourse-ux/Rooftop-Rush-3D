import React from 'react';
import { X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Magnet, Zap } from 'lucide-react';

interface TutorialOverlayProps {
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-black text-white tracking-wide">Parkour Field Manual</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Moves grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Lane Steering */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <ArrowLeft className="w-4 h-4" />
              <ArrowRight className="w-4 h-4" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Steer Lanes</span>
            </div>
            <p className="text-xs text-slate-300">
              Press <b>A / D</b> or <b>Left / Right</b> arrows (or on-screen buttons) to dodge obstacles.
            </p>
          </div>

          {/* Jump */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-orange-400">
              <ArrowUp className="w-4 h-4" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Leap & Vault</span>
            </div>
            <p className="text-xs text-slate-300">
              Press <b>W / Up / Space</b> to jump over low hurdles, barrels, and rooftop gaps.
            </p>
          </div>

          {/* Slide */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <ArrowDown className="w-4 h-4" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Low Slide</span>
            </div>
            <p className="text-xs text-slate-300">
              Press <b>S / Down</b> arrow to slide under overhead neon signs and suspended beams.
            </p>
          </div>

          {/* Fast Fall */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="text-xs font-black">⚡</span>
              <span className="font-extrabold text-xs uppercase tracking-wider">Fast Fall</span>
            </div>
            <p className="text-xs text-slate-300">
              Slide while mid-air to drop back down to the ground immediately.
            </p>
          </div>
        </div>

        {/* Power-ups row */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Power-ups</div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-300">
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-5 h-5 text-sky-400" />
              <span className="font-bold">Shield</span>
              <span className="text-[10px] text-slate-400">Absorbs 1 collision</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Magnet className="w-5 h-5 text-pink-400" />
              <span className="font-bold">Magnet</span>
              <span className="text-[10px] text-slate-400">Attracts coins</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-bold">2X Boost</span>
              <span className="text-[10px] text-slate-400">Doubles score</span>
            </div>
          </div>
        </div>

        {/* Got it CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-sm uppercase tracking-wider transition-colors shadow-lg"
        >
          Got It, Let's Run!
        </button>
      </div>
    </div>
  );
};

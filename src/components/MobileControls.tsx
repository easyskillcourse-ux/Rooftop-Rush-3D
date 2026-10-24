import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
}) => {
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);
  const [jumpActive, setJumpActive] = useState(false);
  const [slideActive, setSlideActive] = useState(false);

  return (
    <div
      className="absolute inset-x-0 bottom-0 pointer-events-none select-none flex justify-between items-end pb-[max(1rem,env(safe-area-inset-bottom))] px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
      style={{ touchAction: 'none' }}
    >
      {/* Left & Right Steering cluster */}
      <div className="flex items-center gap-2.5 sm:gap-4 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setLeftActive(true);
            onLeft();
          }}
          onTouchEnd={() => setLeftActive(false)}
          onTouchCancel={() => setLeftActive(false)}
          onMouseDown={() => {
            setLeftActive(true);
            onLeft();
          }}
          onMouseUp={() => setLeftActive(false)}
          onMouseLeave={() => setLeftActive(false)}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-75 ${
            leftActive
              ? 'bg-cyan-500 border-cyan-300 scale-90'
              : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/80 active:scale-95'
          }`}
          aria-label="Steer Left"
        >
          <ArrowLeft className={`w-8 h-8 ${leftActive ? 'text-white' : 'text-cyan-400'}`} />
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">LEFT</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setRightActive(true);
            onRight();
          }}
          onTouchEnd={() => setRightActive(false)}
          onTouchCancel={() => setRightActive(false)}
          onMouseDown={() => {
            setRightActive(true);
            onRight();
          }}
          onMouseUp={() => setRightActive(false)}
          onMouseLeave={() => setRightActive(false)}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-75 ${
            rightActive
              ? 'bg-cyan-500 border-cyan-300 scale-90'
              : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/80 active:scale-95'
          }`}
          aria-label="Steer Right"
        >
          <ArrowRight className={`w-8 h-8 ${rightActive ? 'text-white' : 'text-cyan-400'}`} />
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">RIGHT</span>
        </button>
      </div>

      {/* Slide & Jump Action cluster */}
      <div className="flex items-center gap-2.5 sm:gap-4 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setSlideActive(true);
            onSlide();
          }}
          onTouchEnd={() => setSlideActive(false)}
          onTouchCancel={() => setSlideActive(false)}
          onMouseDown={() => {
            setSlideActive(true);
            onSlide();
          }}
          onMouseUp={() => setSlideActive(false)}
          onMouseLeave={() => setSlideActive(false)}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-75 ${
            slideActive
              ? 'bg-amber-500 border-amber-300 scale-90'
              : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/80 active:scale-95'
          }`}
          aria-label="Slide Under Barrier"
        >
          <ArrowDown className={`w-8 h-8 ${slideActive ? 'text-slate-950 font-black' : 'text-amber-400'}`} />
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">SLIDE</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setJumpActive(true);
            onJump();
          }}
          onTouchEnd={() => setJumpActive(false)}
          onTouchCancel={() => setJumpActive(false)}
          onMouseDown={() => {
            setJumpActive(true);
            onJump();
          }}
          onMouseUp={() => setJumpActive(false)}
          onMouseLeave={() => setJumpActive(false)}
          className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-75 ${
            jumpActive
              ? 'bg-orange-500 border-orange-300 scale-90'
              : 'bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 border-orange-400 active:scale-95'
          }`}
          aria-label="Jump Over Obstacle or Gap"
        >
          <ArrowUp className="w-9 h-9 text-white font-extrabold" />
          <span className="text-[11px] font-black tracking-wider uppercase text-amber-100">JUMP</span>
        </button>
      </div>
    </div>
  );
};

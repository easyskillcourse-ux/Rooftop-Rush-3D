import React, { useState } from 'react';
import { Difficulty, CharacterSkin } from '../types';
import {
  Play,
  Settings,
  HelpCircle,
  Shirt,
  Crown,
  Plus,
  Lock,
  ChevronRight,
  Coins,
} from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  bestScore: number;
  totalCoins: number;
  currentSkin: CharacterSkin;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenShop,
  onOpenSettings,
  onOpenTutorial,
  difficulty,
  onSelectDifficulty,
  bestScore,
  totalCoins,
  currentSkin,
}) => {
  // Rapid-click debounce protection to prevent multiple launches
  const [isStarting, setIsStarting] = useState(false);

  const handlePlayClick = () => {
    if (isStarting) return;
    setIsStarting(true);
    onStart();
    setTimeout(() => {
      setIsStarting(false);
    }, 1200);
  };

  const isHardUnlocked = bestScore >= 150;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none z-10">
      {/* 1. TOP BAR: Banked Coins with Plus button (Left) & Help / Settings (Right) */}
      <header className="flex justify-between items-center pointer-events-auto">
        {/* Top-Left: Coin Balance with working Plus button */}
        <div
          onClick={onOpenShop}
          className="group cursor-pointer bg-slate-900/90 hover:bg-slate-800/95 border border-amber-500/30 hover:border-amber-400/60 rounded-full pl-3.5 pr-1.5 py-1.5 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all active:scale-95"
          title="Open Hero Locker & Skin Shop"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenShop();
            }
          }}
        >
          {/* Animated coin icon */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border border-yellow-200 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform">
            <Coins className="w-4 h-4 text-amber-950 fill-amber-950/20" />
          </div>

          {/* Formatted coin count */}
          <div className="flex flex-col leading-none">
            <span className="text-sm sm:text-base font-black text-amber-300 tabular-nums tracking-wide">
              {totalCoins.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-amber-200/60 uppercase tracking-widest">
              Coins
            </span>
          </div>

          {/* Interactive '+' Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenShop();
            }}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-90 text-amber-950 font-black flex items-center justify-center shadow-md transition-transform"
            aria-label="Get more skins and coins"
            title="Skins & Upgrades"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Top-Right: Help and Settings Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Help Button */}
          <button
            onClick={onOpenTutorial}
            className="w-11 h-11 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 hover:border-sky-500/40 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-95 transition-all"
            aria-label="How to play"
            title="How to Play / Field Manual"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 hover:border-sky-500/40 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-95 transition-all"
            aria-label="Settings"
            title="Game Audio and Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. UPPER CENTER: Dimensional Title Lockup, Subtitle & Crown Best Record */}
      <div className="flex flex-col items-center text-center mt-1 sm:mt-2 mb-auto max-w-2xl mx-auto w-full px-2">
        {/* Dimensional Vector Title: ROOFTOP RUSH 3D */}
        <div className="w-full max-w-lg md:max-w-xl">
          <svg viewBox="0 0 600 135" className="w-full h-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)] overflow-visible">
            <defs>
              {/* Vibrant Fiery Gradient for RUSH 3D */}
              <linearGradient id="rushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff781f" />
                <stop offset="45%" stopColor="#f59e0b" />
                <stop offset="85%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>

              {/* Silver Metallic Gradient for ROOFTOP */}
              <linearGradient id="rooftopGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* Outer Glow */}
              <filter id="rushGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#f97316" floodOpacity="0.65" />
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* ROOFTOP 3D Shadow Extrusion */}
            <text
              x="300"
              y="51"
              textAnchor="middle"
              style={{
                fontSize: '38px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                fill: '#0f172a',
                letterSpacing: '0.24em',
              }}
            >
              ROOFTOP
            </text>

            {/* ROOFTOP Main Layer */}
            <text
              x="300"
              y="47"
              textAnchor="middle"
              style={{
                fontSize: '38px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                fill: 'url(#rooftopGradient)',
                letterSpacing: '0.24em',
                stroke: '#ffffff',
                strokeWidth: '0.75px',
              }}
            >
              ROOFTOP
            </text>

            {/* RUSH 3D Shadow Layer */}
            <text
              x="300"
              y="119"
              textAnchor="middle"
              style={{
                fontSize: '76px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.05em',
                fill: '#7c2d12',
              }}
            >
              RUSH 3D
            </text>

            {/* RUSH 3D Mid Extrusion Layer */}
            <text
              x="300"
              y="116"
              textAnchor="middle"
              style={{
                fontSize: '76px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.05em',
                fill: '#c2410c',
              }}
            >
              RUSH 3D
            </text>

            {/* RUSH 3D Glowing Front Layer */}
            <text
              x="300"
              y="112"
              textAnchor="middle"
              filter="url(#rushGlow)"
              style={{
                fontSize: '76px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.05em',
                fill: 'url(#rushGradient)',
                stroke: '#ffffff',
                strokeWidth: '1.8px',
                paintOrder: 'stroke fill',
              }}
            >
              RUSH 3D
            </text>
          </svg>
        </div>

        {/* Subtitle with high legibility */}
        <p className="text-slate-100 font-bold text-xs sm:text-sm md:text-base mt-0.5 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Endless Rooftop &amp; Wild Forest Parkour Adventure
        </p>

        {/* Best Record Crown Badge */}
        <div className="mt-2.5 inline-flex items-center gap-2 bg-slate-900/80 hover:bg-slate-900/95 border border-amber-500/40 rounded-full px-4 py-1 shadow-[0_4px_16px_rgba(245,158,11,0.2)] backdrop-blur-sm pointer-events-auto transition-transform hover:scale-105">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          <span className="text-xs sm:text-sm font-semibold text-slate-300">Best Record:</span>
          <span className="text-xs sm:text-sm font-black text-amber-300 tabular-nums">
            {bestScore > 0 ? `${bestScore.toLocaleString()} pts` : '0 pts'}
          </span>
        </div>
      </div>

      {/* Note: Character is centered in the 3D viewport between upper title and bottom dock */}

      {/* 3. BOTTOM DOCK: Difficulty Selector, Hero Skins Button & Play Now CTA */}
      <footer className="flex flex-col items-center gap-3 max-w-lg mx-auto w-full pointer-events-auto">
        {/* Horizontal Difficulty Selector */}
        <div className="bg-slate-950/85 border border-slate-800/90 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md w-full justify-center">
          {(['BEGINNER', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => {
            const active = difficulty === d;
            const isHard = d === 'HARD';
            const isLocked = isHard && !isHardUnlocked;

            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onSelectDifficulty(d);
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-[0_2px_12px_rgba(249,115,22,0.45)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
                title={
                  isLocked
                    ? 'Hardcore speed (Score 150+ pts to master)'
                    : `${d} difficulty mode`
                }
              >
                <span>{d}</span>
                {isLocked ? (
                  <span className="inline-flex items-center text-[10px] text-amber-300/80 font-bold lowercase">
                    <Lock className="w-3 h-3 inline mr-0.5" />
                    150
                  </span>
                ) : isHard ? (
                  <span className="text-[10px] text-amber-300 font-extrabold">1.1x</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Action Row: Hero Skins & Play Now Buttons */}
        <div className="flex items-center gap-3 w-full">
          {/* Navy-Blue Hero Skins Button */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#0b1329]/95 hover:bg-[#132247] active:scale-[0.98] text-white border border-sky-400/35 hover:border-sky-400/60 font-black text-xs sm:text-sm tracking-wide flex items-center justify-between gap-2 shadow-[0_8px_25px_rgba(14,165,233,0.15)] backdrop-blur-md transition-all group"
            title="Customize Runner Outfit and Accessories"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shrink-0">
                <Shirt className="w-4 h-4 text-sky-300" />
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="text-xs uppercase font-extrabold text-sky-200 tracking-wider">
                  Hero Skins
                </span>
                <span className="text-[11px] font-semibold text-slate-400 truncate">
                  {currentSkin.name}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-400/70 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Large Orange Gradient PLAY NOW Button with Rapid-Click Guard */}
          <button
            type="button"
            onClick={handlePlayClick}
            disabled={isStarting}
            className={`flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_8px_25px_rgba(249,115,22,0.45)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.65)] active:scale-[0.98] transition-all ${
              isStarting ? 'opacity-85 cursor-not-allowed scale-[0.99]' : ''
            }`}
            title="Start Rooftop Rush 3D"
          >
            <Play className="w-5 h-5 fill-white stroke-none" />
            <span>PLAY NOW</span>
          </button>
        </div>

        {/* Responsive Control Guidance */}
        <p className="text-[11px] sm:text-xs font-semibold text-slate-300/90 text-center tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          WASD / Arrow Keys or Swipe to Move &amp; Jump · Space to Leap
        </p>
      </footer>
    </div>
  );
};

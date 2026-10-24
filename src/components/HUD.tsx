import React, { useState, useEffect } from 'react';
import { GameScore, ActivePowerUp, EnvironmentTheme } from '../types';
import { Shield, Magnet, Zap, Pause, Award, Maximize2, Minimize2, Gauge } from 'lucide-react';

interface HUDProps {
  score: GameScore;
  powerUps: ActivePowerUp[];
  theme: EnvironmentTheme;
  checkpointBanner?: string | null;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ score, powerUps, theme, checkpointBanner, onPause }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coinPulse, setCoinPulse] = useState(false);
  const [prevCoins, setPrevCoins] = useState(score.coins);

  useEffect(() => {
    if (score.coins > prevCoins) {
      setCoinPulse(true);
      const timer = setTimeout(() => setCoinPulse(false), 240);
      setPrevCoins(score.coins);
      return () => clearTimeout(timer);
    } else {
      setPrevCoins(score.coins);
    }
  }, [score.coins, prevCoins]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const getThemeBadge = (t: EnvironmentTheme) => {
    switch (t) {
      case 'LUSH_FOREST':
        return { label: 'Tropical Canopy', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'RIVER_CROSSING':
        return { label: 'River Gorge Bridge', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'MONSOON_RAIN':
        return { label: 'Cartoon Monsoon', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'MOUNTAIN_BRIDGE':
        return { label: 'Canyon Suspension Bridge', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'SUNSET_CITY':
      default:
        return { label: 'Sunset Metropolis', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    }
  };

  const badge = getThemeBadge(theme);

  return (
    <div className="absolute inset-0 pointer-events-none pt-[max(1rem,env(safe-area-inset-top))] px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col justify-between select-none">
      {/* Top Bar: Distance, Zone, Score, Coins, Fullscreen & Pause */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Distance, Zone & Live Speed */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md tabular-nums">
              {score.distance}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-300 tracking-wider uppercase mt-1">m</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${badge.bg}`}>
              {badge.label}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-900/85 border border-slate-700/60 text-cyan-300 shadow">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span className="tabular-nums font-black">{score.speed ? score.speed.toFixed(1) : '25.0'}</span>
              <span className="text-[9px] text-slate-400">u/s</span>
            </div>
          </div>
        </div>

        {/* Center: Score & Multiplier */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-300">Score</div>
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-4xl md:text-5xl font-black text-amber-300 tracking-tight drop-shadow-lg tabular-nums">
              {score.score}
            </span>
            {score.multiplier > 1 && (
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full animate-bounce shadow">
                {score.multiplier}X
              </span>
            )}
          </div>
        </div>

        {/* Right: Coins, Fullscreen, and Pause */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Coins / Gems Counter */}
          <div
            className={`border rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-2 sm:gap-3 shadow-lg transition-all duration-150 ${
              coinPulse
                ? 'scale-110 bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/50'
                : 'scale-100 bg-slate-900/85 border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-1">
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 border border-amber-300 flex items-center justify-center shadow-inner ${coinPulse ? 'animate-spin' : ''}`}>
                <span className="text-[9px] sm:text-[10px] font-black text-amber-950">★</span>
              </div>
              <span className={`text-xs sm:text-base font-extrabold tabular-nums ${coinPulse ? 'text-amber-200' : 'text-amber-300'}`}>
                {score.coins}
              </span>
            </div>

            {score.gems > 0 && (
              <div className="flex items-center gap-1 pl-1.5 border-l border-slate-700">
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-45 bg-emerald-400 border border-emerald-300 shadow-sm" />
                <span className="text-xs sm:text-base font-extrabold text-emerald-300 tabular-nums">
                  {score.gems}
                </span>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Toggle Fullscreen"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-700/60 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Checkpoint Banner Notification */}
      {checkpointBanner && (
        <div className="self-center bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 text-white font-black text-xs sm:text-base px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl shadow-2xl border-2 border-yellow-200 flex items-center gap-2 animate-bounce">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span>{checkpointBanner}</span>
        </div>
      )}

      {/* Active Power-ups Bar (Above Mobile Controls) */}
      <div className="flex flex-col gap-1.5 max-w-[200px] sm:max-w-xs mb-20 sm:mb-24 md:mb-6">
        {powerUps.map((pu) => {
          const percent = Math.max(0, Math.min(100, (pu.timeLeft / pu.duration) * 100));
          return (
            <div
              key={pu.type}
              className="bg-slate-900/85 border border-slate-700/70 rounded-xl p-1.5 sm:p-2 flex items-center gap-2 shadow-lg"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0">
                {pu.type === 'SHIELD' && <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />}
                {pu.type === 'MAGNET' && <Magnet className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />}
                {pu.type === 'MULTIPLIER' && <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />}
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-[10px] sm:text-xs font-bold text-slate-200 mb-0.5">
                  <span className="truncate">
                    {pu.type === 'SHIELD' ? 'Shield' : pu.type === 'MAGNET' ? 'Magnet' : '2x Score'}
                  </span>
                  <span className="tabular-nums text-slate-400">{pu.timeLeft.toFixed(1)}s</span>
                </div>
                <div className="h-1 sm:h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      pu.type === 'SHIELD'
                        ? 'bg-sky-400'
                        : pu.type === 'MAGNET'
                        ? 'bg-pink-400'
                        : 'bg-purple-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

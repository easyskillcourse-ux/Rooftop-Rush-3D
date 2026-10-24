import React from 'react';
import { GameSettings, Difficulty, GraphicsQuality } from '../types';
import { X, Volume2, VolumeX, Music, ShieldAlert, Monitor } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onClose,
}) => {
  const handleToggleSound = () => {
    const next = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: next };
    onUpdateSettings(updated);
    sounds.setVolumes(updated.soundVolume, updated.musicVolume, updated.soundEnabled, updated.musicEnabled);
    if (next) sounds.playJump();
  };

  const handleToggleMusic = () => {
    const next = !settings.musicEnabled;
    const updated = { ...settings, musicEnabled: next };
    onUpdateSettings(updated);
    sounds.setVolumes(updated.soundVolume, updated.musicVolume, updated.soundEnabled, updated.musicEnabled);
  };

  const handleDifficultyChange = (d: Difficulty) => {
    const updated = { ...settings, difficulty: d };
    onUpdateSettings(updated);
  };

  const handleQualityChange = (q: GraphicsQuality) => {
    const updated = { ...settings, graphicsQuality: q };
    onUpdateSettings(updated);
  };

  const [confirmReset, setConfirmReset] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-black text-white tracking-wide">Game & Graphics Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings list */}
        <div className="flex flex-col gap-5">
          {/* Graphics Quality */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-sm text-white">Graphics Quality</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase transition-all ${
                    settings.graphicsQuality === q
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Low: Max FPS for mobile • Medium: Balanced • High: Dense cartoon flora & soft shadows
            </p>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="font-extrabold text-sm text-white">Sound Effects</div>
                <div className="text-xs text-slate-400">Jumps, slides, coin chimes & crashes</div>
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                settings.soundEnabled ? 'bg-orange-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className={`w-5 h-5 ${settings.musicEnabled ? 'text-sky-400' : 'text-slate-500'}`} />
              <div>
                <div className="font-extrabold text-sm text-white">Synthesizer Soundtrack</div>
                <div className="text-xs text-slate-400">Upbeat procedural synth music loop</div>
              </div>
            </div>

            <button
              onClick={handleToggleMusic}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                settings.musicEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Difficulty Setting with running speed details */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-sm text-white">Game Difficulty & Speed</span>
              <span className="text-[11px] font-bold text-cyan-300">
                {settings.difficulty === 'BEGINNER' ? '22 u/s' : settings.difficulty === 'NORMAL' ? '25 u/s (Standard)' : '28 u/s'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['BEGINNER', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase transition-all ${
                    settings.difficulty === d
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {settings.difficulty === 'BEGINNER'
                ? 'Beginner: Relaxed 22.0 u/s pace, lower obstacle density.'
                : settings.difficulty === 'NORMAL'
                ? 'Normal: Default 25.0 u/s, gradual speed between 20–30 u/s.'
                : 'Hardcore: 28.0 u/s base sprint, maximum obstacle density (capped < 100).'}
            </p>
          </div>

          {/* Reset high score */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Reset Game Records</span>
            </div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetData();
                    setConfirmReset(false);
                  }}
                  className="text-xs font-black text-red-400 bg-red-950/60 border border-red-500/50 px-2 py-1 rounded-lg hover:bg-red-900 cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                Clear Records
              </button>
            )}
          </div>
        </div>

        {/* Done button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm uppercase tracking-wider transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};

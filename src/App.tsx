/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  GameState,
  EnvironmentTheme,
  Difficulty,
  CharacterSkin,
  ActivePowerUp,
  GameScore,
  GameSettings,
} from './types';
import { INITIAL_SKINS } from './game/constants';
import { GameEngine } from './game/GameEngine';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { TitleScreen } from './components/TitleScreen';
import { ShopModal } from './components/ShopModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { sounds } from './audio/SoundEffects';

const STORAGE_KEY_BEST = 'rooftop_rush_best_score';
const STORAGE_KEY_COINS = 'rooftop_rush_total_coins';
const STORAGE_KEY_SKINS = 'rooftop_rush_unlocked_skins';
const STORAGE_KEY_EQUIPPED = 'rooftop_rush_equipped_skin';
const STORAGE_KEY_SETTINGS = 'rooftop_rush_settings';

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistent Game Data
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_BEST) || '0', 10);
    } catch {
      return 0;
    }
  });

  const [totalCoins, setTotalCoins] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_COINS) || '0', 10);
    } catch {
      return 0;
    }
  });

  const [skins, setSkins] = useState<CharacterSkin[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SKINS);
      if (stored) {
        const unlockedIds: string[] = JSON.parse(stored);
        return INITIAL_SKINS.map((s) => ({
          ...s,
          unlocked: s.unlocked || unlockedIds.includes(s.id),
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_SKINS;
  });

  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_EQUIPPED) || INITIAL_SKINS[0].id;
    } catch {
      return INITIAL_SKINS[0].id;
    }
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 0.8,
      musicVolume: 0.5,
      difficulty: 'NORMAL',
      graphicsQuality: 'HIGH',
      vibration: true,
    };
  });

  // Runtime State
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [theme, setTheme] = useState<EnvironmentTheme>('LUSH_FOREST');
  const [score, setScore] = useState<GameScore>({
    distance: 0,
    coins: 0,
    gems: 0,
    score: 0,
    multiplier: 1,
  });
  const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);
  const [checkpointBanner, setCheckpointBanner] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal Dialogs
  const [showShop, setShowShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const activeSkin = skins.find((s) => s.id === activeSkinId) || skins[0];

  // Initialize GameEngine
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, activeSkin);
    engineRef.current = engine;

    // Apply settings
    sounds.setVolumes(settings.soundVolume, settings.musicVolume, settings.soundEnabled, settings.musicEnabled);
    engine.setDifficulty(settings.difficulty);
    engine.setGraphicsQuality(settings.graphicsQuality);

    // Warm shaders once
    try {
      engine.renderer.compile(engine.scene, engine.camera);
    } catch {
      // ignore
    }
    setIsLoaded(true);

    // Callbacks
    engine.onStateChange = (newState) => {
      setGameState(newState);
    };

    engine.onScoreUpdate = (currentScore) => {
      setScore(currentScore);
      setTheme(engine.currentTheme);
    };

    engine.onPowerUpsUpdate = (activeList) => {
      setPowerUps(activeList);
    };

    engine.onCheckpointReached = (meters) => {
      setCheckpointBanner(`🌟 Checkpoint reached: ${meters}m (+100 pts)`);
      setTimeout(() => {
        setCheckpointBanner(null);
      }, 2500);
    };

    engine.onGameOver = (finalScore) => {
      // Add coins to wallet
      setTotalCoins((prev) => {
        const next = prev + finalScore.coins;
        try {
          localStorage.setItem(STORAGE_KEY_COINS, next.toString());
        } catch {
          // ignore
        }
        return next;
      });

      // Check high score
      setBestScore((prevBest) => {
        if (finalScore.score > prevBest) {
          setIsNewBest(true);
          try {
            localStorage.setItem(STORAGE_KEY_BEST, finalScore.score.toString());
          } catch {
            // ignore
          }
          return finalScore.score;
        } else {
          setIsNewBest(false);
          return prevBest;
        }
      });
    };

    // Resize observer
    const handleResize = () => {
      if (!mountRef.current) return;
      engine.handleResize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Update skin if activeSkin changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkin(activeSkin);
    }
  }, [activeSkin]);

  // Update difficulty and graphics if settings change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setDifficulty(settings.difficulty);
      engineRef.current.setGraphicsQuality(settings.graphicsQuality);
    }
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Handlers for Player Actions
  const handleStart = () => {
    engineRef.current?.startGame();
  };

  const handlePause = () => {
    engineRef.current?.togglePause();
  };

  const handleResume = () => {
    engineRef.current?.togglePause();
  };

  const handleRestart = () => {
    engineRef.current?.restartGame();
  };

  const handleHome = () => {
    engineRef.current?.returnToTitle();
  };

  const handleSelectDifficulty = (d: Difficulty) => {
    setSettings((prev) => ({ ...prev, difficulty: d }));
    engineRef.current?.setDifficulty(d);
  };

  const handleSelectSkin = (skin: CharacterSkin) => {
    setActiveSkinId(skin.id);
    try {
      localStorage.setItem(STORAGE_KEY_EQUIPPED, skin.id);
    } catch {
      // ignore
    }
  };

  const handleUnlockSkin = (skinId: string, cost: number) => {
    if (totalCoins < cost) return;

    setTotalCoins((prev) => {
      const next = prev - cost;
      try {
        localStorage.setItem(STORAGE_KEY_COINS, next.toString());
      } catch {
        // ignore
      }
      return next;
    });

    setSkins((prevSkins) => {
      const updated = prevSkins.map((s) => (s.id === skinId ? { ...s, unlocked: true } : s));
      try {
        const unlockedIds = updated.filter((s) => s.unlocked).map((s) => s.id);
        localStorage.setItem(STORAGE_KEY_SKINS, JSON.stringify(unlockedIds));
      } catch {
        // ignore
      }
      return updated;
    });

    // Auto-equip newly unlocked skin
    setActiveSkinId(skinId);
    try {
      localStorage.setItem(STORAGE_KEY_EQUIPPED, skinId);
    } catch {
      // ignore
    }
  };

  const handleResetRecords = () => {
    setBestScore(0);
    setTotalCoins(0);
    try {
      localStorage.removeItem(STORAGE_KEY_BEST);
      localStorage.removeItem(STORAGE_KEY_COINS);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Initial Asset Preload Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center gap-3 select-none">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-black uppercase tracking-widest text-orange-400">
            Preloading 3D Adventure...
          </div>
        </div>
      )}

      {/* Title Screen Overlay */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={handleStart}
          onOpenShop={() => setShowShop(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenTutorial={() => setShowTutorial(true)}
          difficulty={settings.difficulty}
          onSelectDifficulty={handleSelectDifficulty}
          bestScore={bestScore}
          totalCoins={totalCoins}
          currentSkin={activeSkin}
        />
      )}

      {/* Active In-Game HUD */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            score={score}
            powerUps={powerUps}
            theme={theme}
            checkpointBanner={checkpointBanner}
            onPause={handlePause}
          />

          {/* Large Ergonomic Touch Controls for Mobile */}
          <MobileControls
            onLeft={() => engineRef.current?.changeLane(-1)}
            onRight={() => engineRef.current?.changeLane(1)}
            onJump={() => engineRef.current?.jump()}
            onSlide={() => engineRef.current?.slide()}
          />
        </>
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          isNewBest={isNewBest}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenShop={() => setShowShop(true)}
        />
      )}

      {/* Shop / Skin Customizer Modal */}
      {showShop && (
        <ShopModal
          skins={skins}
          activeSkinId={activeSkinId}
          totalCoins={totalCoins}
          onSelectSkin={handleSelectSkin}
          onUnlockSkin={handleUnlockSkin}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Game Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onResetData={handleResetRecords}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Field Manual / Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}

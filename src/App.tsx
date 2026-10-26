import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameEngine } from './game/GameEngine';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { BallShop } from './components/BallShop';
import { LavaShop } from './components/LavaShop';
import { LeaderboardModal } from './components/LeaderboardModal';
import { MissionsModal } from './components/MissionsModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { loadPlayerStats, savePlayerStats, loadGameSettings, saveGameSettings } from './utils/storage';
import { audio } from './utils/audio';
import { BallItem, GameSettings, Mission, PlayerStats, PowerUpType } from './types/game';

type ActiveScreen =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'game_over'
  | 'ball_shop'
  | 'lava_shop'
  | 'leaderboard'
  | 'missions'
  | 'profile'
  | 'settings'
  | 'how_to_play';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Persistent State
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings);

  // Live Run State
  const [screen, setScreen] = useState<ActiveScreen>('menu');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [activePower, setActivePower] = useState<PowerUpType | null>(null);
  const [powerTimeLeft, setPowerTimeLeft] = useState(0);
  const [nearMissCombo, setNearMissCombo] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isNewHigh, setIsNewHigh] = useState(false);

  // Direct finger touch and drag tracking
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialTouchPos = useRef<{ x: number; y: number } | null>(null);
  const isPointerDragging = useRef<boolean>(false);

  // Sync settings with audio and 3D engine
  useEffect(() => {
    audio.updateSettings(settings.soundEnabled, settings.musicVolume, settings.sfxVolume);
    if (engineRef.current) {
      engineRef.current.tiltEnabled = settings.tiltEnabled;
      engineRef.current.tiltSensitivity = settings.tiltSensitivity;
      engineRef.current.setDayNightMode(settings.timeOfDay === 'day');
    }
  }, [settings]);

  // Save stats whenever updated
  const updateStats = useCallback((updater: (prev: PlayerStats) => PlayerStats) => {
    setStats((prev) => {
      const next = updater(prev);
      savePlayerStats(next);
      return next;
    });
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    saveGameSettings(newSettings);
  }, []);

  // Day & Night toggle
  const toggleDayNight = useCallback(() => {
    const nextTime = settings.timeOfDay === 'day' ? 'night' : 'day';
    updateSettings({ ...settings, timeOfDay: nextTime });
    if (engineRef.current) {
      engineRef.current.setDayNightMode(nextTime === 'day');
    }
    audio.buttonClick();
  }, [settings, updateSettings]);

  // Initialize Three.js Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      {
        onScoreUpdate: (s, c, d) => {
          setScore(s);
          setCoins(c);
          setDistance(d);
        },
        onLivesUpdate: (l) => {
          setLives(l);
          if (l < 3) {
            setIsRecovering(true);
            setTimeout(() => setIsRecovering(false), 2800);
          }
        },
        onPowerUpUpdate: (power, timeLeft) => {
          setActivePower(power);
          setPowerTimeLeft(timeLeft);
        },
        onNearMiss: (combo) => {
          setNearMissCombo(combo);
          updateStats((prev) => ({
            ...prev,
            totalNearMisses: prev.totalNearMisses + 1
          }));
        },
        onObstacleJumped: () => {
          // Track jump progress
        },
        onGameOver: (finalScore, finalCoins, finalDistance, finalNearMisses) => {
          setScreen('game_over');
          updateStats((prev) => {
            const isHigh = finalScore > prev.highScore;
            setIsNewHigh(isHigh);
            return {
              ...prev,
              highScore: Math.max(prev.highScore, finalScore),
              totalCoinsEarned: prev.totalCoinsEarned + finalCoins,
              totalDistance: prev.totalDistance + finalDistance,
              totalRuns: prev.totalRuns + 1,
              totalNearMisses: prev.totalNearMisses + finalNearMisses
            };
          });
        }
      },
      stats.equippedBall,
      settings.timeOfDay === 'day'
    );

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Tilt sensor event listener
  useEffect(() => {
    if (!settings.tiltEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && engineRef.current) {
        engineRef.current.handleTilt(e.gamma);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [settings.tiltEnabled]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.userInteractionTrigger();
      if (!engineRef.current) return;

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        engineRef.current.leftHeld = true;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        engineRef.current.rightHeld = true;
      }
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key.toLowerCase() === 'w') {
        engineRef.current.jump();
      }
      if (e.key.toLowerCase() === 'p') {
        if (screen === 'playing') handlePause();
        else if (screen === 'paused') handleResume();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        engineRef.current.leftHeld = false;
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        engineRef.current.rightHeld = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  // Touch gesture & Direct finger dragging handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    audio.userInteractionTrigger();
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY };
    initialTouchPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !engineRef.current || screen !== 'playing' || settings.tiltEnabled) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartPos.current.x;

    // Direct real-time finger drag steering!
    engineRef.current.dragSteer(dx);
    touchStartPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!initialTouchPos.current || !engineRef.current || screen !== 'playing') return;
    const t = e.changedTouches[0];
    const totalDy = t.clientY - initialTouchPos.current.y;
    const totalDx = t.clientX - initialTouchPos.current.x;

    // Upward swipe -> Jump!
    if (totalDy < -35 && Math.abs(totalDy) > Math.abs(totalDx) * 0.7) {
      engineRef.current.jump();
    }

    touchStartPos.current = null;
    initialTouchPos.current = null;
  };

  // Pointer drag for desktop and hybrid input
  const handlePointerDown = (e: React.PointerEvent) => {
    if (screen !== 'playing') return;
    audio.userInteractionTrigger();
    isPointerDragging.current = true;
    touchStartPos.current = { x: e.clientX, y: e.clientY };
    initialTouchPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDragging.current || !touchStartPos.current || !engineRef.current || screen !== 'playing' || settings.tiltEnabled) return;
    const dx = e.clientX - touchStartPos.current.x;
    engineRef.current.dragSteer(dx);
    touchStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDragging.current || !initialTouchPos.current || !engineRef.current || screen !== 'playing') {
      isPointerDragging.current = false;
      return;
    }
    const totalDy = e.clientY - initialTouchPos.current.y;
    const totalDx = e.clientX - initialTouchPos.current.x;

    if (totalDy < -35 && Math.abs(totalDy) > Math.abs(totalDx) * 0.7) {
      engineRef.current.jump();
    }
    isPointerDragging.current = false;
    touchStartPos.current = null;
    initialTouchPos.current = null;
  };

  // Game Control Actions
  const handleStartRun = () => {
    audio.userInteractionTrigger();
    setScore(0);
    setCoins(0);
    setDistance(0);
    setLives(3);
    setIsNewHigh(false);
    setScreen('playing');
    if (engineRef.current) {
      engineRef.current.startRun();
    }
  };

  const handlePause = () => {
    setScreen('paused');
    if (engineRef.current) {
      engineRef.current.pauseRun();
    }
  };

  const handleResume = () => {
    setScreen('playing');
    if (engineRef.current) {
      engineRef.current.resumeRun();
    }
  };

  const handleRestart = () => {
    try {
      const y8 = (window as unknown as { y8Sdk?: { showAd: (opts: Record<string, unknown>) => Promise<unknown> } }).y8Sdk;
      if (y8 && typeof y8.showAd === 'function') {
        y8.showAd({ type: 'next', name: 'restart' }).catch(() => {});
      }
    } catch {}

    handleStartRun();
  };

  const handleReturnHome = () => {
    setScreen('menu');
    audio.stopMusic();
    if (engineRef.current) {
      engineRef.current.resetRunState();
    }
  };

  // Ball purchase & equip
  const handleBuyBall = (ball: BallItem) => {
    if (stats.totalCoinsEarned < ball.price) return;
    if (stats.ownedBalls.includes(ball.id)) return;

    updateStats((prev) => ({
      ...prev,
      totalCoinsEarned: prev.totalCoinsEarned - ball.price,
      ownedBalls: [...prev.ownedBalls, ball.id],
      equippedBall: ball.id
    }));

    if (engineRef.current) {
      engineRef.current.applyEquippedBall(ball);
    }
    audio.purchase();

    if (ball.rarity === 'GOD' || ball.rarity === 'MYTHIC') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleEquipBall = (ball: BallItem) => {
    if (!stats.ownedBalls.includes(ball.id)) return;

    updateStats((prev) => ({
      ...prev,
      equippedBall: ball.id
    }));

    if (engineRef.current) {
      engineRef.current.applyEquippedBall(ball);
    }
    audio.buttonClick();
  };

  // Mission claim
  const handleClaimMission = (mission: Mission) => {
    if (stats.claimedMissions.includes(mission.id)) return;

    updateStats((prev) => ({
      ...prev,
      totalCoinsEarned: prev.totalCoinsEarned + mission.rewardCoins,
      missionsCompleted: prev.missionsCompleted + 1,
      claimedMissions: [...prev.claimedMissions, mission.id]
    }));

    audio.purchase();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  // Toggle Tilt Sensor with iOS Permission request
  const handleToggleTilt = async () => {
    if (settings.tiltEnabled) {
      updateSettings({ ...settings, tiltEnabled: false });
      return;
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const req = (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission;
        const res = await req();
        if (res === 'granted') {
          updateSettings({ ...settings, tiltEnabled: true });
        } else {
          alert('Motion access was not granted by your browser.');
        }
      } catch {
        alert('Could not enable tilt. Please open in Safari or Chrome over HTTPS.');
      }
    } else {
      updateSettings({ ...settings, tiltEnabled: true });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050a18]">
      {/* 3D WebGL Canvas Layer with direct touch & pointer drag support */}
      <div
        ref={canvasMountRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Screen Layer Routing */}
      {screen === 'menu' && (
        <MainMenu
          stats={stats}
          isDayMode={settings.timeOfDay === 'day'}
          onToggleDayNight={toggleDayNight}
          onStartRun={handleStartRun}
          onOpenBallShop={() => setScreen('ball_shop')}
          onOpenLavaShop={() => setScreen('lava_shop')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onOpenMissions={() => setScreen('missions')}
          onOpenSettings={() => setScreen('settings')}
          onOpenHowToPlay={() => setScreen('how_to_play')}
          onOpenProfile={() => setScreen('profile')}
        />
      )}

      {screen === 'playing' && (
        <HUD
          score={score}
          bestScore={stats.highScore}
          runCoins={coins}
          totalCoins={stats.totalCoinsEarned}
          lives={lives}
          activePower={activePower}
          powerTimeLeft={powerTimeLeft}
          nearMissCombo={nearMissCombo}
          soundEnabled={settings.soundEnabled}
          tiltEnabled={settings.tiltEnabled}
          isDayMode={settings.timeOfDay === 'day'}
          onToggleSound={() => updateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
          onPause={handlePause}
          onRestart={handleRestart}
          onToggleTilt={handleToggleTilt}
          onToggleDayNight={toggleDayNight}
          onSteerLeft={() => engineRef.current?.steerLeft()}
          onSteerRight={() => engineRef.current?.steerRight()}
          onJump={() => engineRef.current?.jump()}
          isRecovering={isRecovering}
        />
      )}

      {screen === 'paused' && (
        <PauseModal
          score={score}
          coins={coins}
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenShop={() => setScreen('ball_shop')}
          onHome={handleReturnHome}
        />
      )}

      {screen === 'game_over' && (
        <GameOverModal
          score={score}
          coins={coins}
          distance={Math.floor(distance)}
          nearMisses={nearMissCombo}
          bestScore={stats.highScore}
          isNewHigh={isNewHigh}
          playerName={stats.playerName}
          onUpdatePlayerName={(name) => updateStats((p) => ({ ...p, playerName: name }))}
          onRestart={handleRestart}
          onHome={handleReturnHome}
        />
      )}

      {screen === 'ball_shop' && (
        <BallShop
          coins={stats.totalCoinsEarned}
          ownedBalls={stats.ownedBalls}
          equippedBall={stats.equippedBall}
          onBuyBall={handleBuyBall}
          onEquipBall={handleEquipBall}
          onClose={() => setScreen('menu')}
        />
      )}

      {screen === 'lava_shop' && (
        <LavaShop
          coins={stats.totalCoinsEarned}
          ownedBalls={stats.ownedBalls}
          equippedBall={stats.equippedBall}
          onBuyBall={handleBuyBall}
          onEquipBall={handleEquipBall}
          onClose={() => setScreen('menu')}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardModal
          currentScore={score}
          playerName={stats.playerName}
          onUpdatePlayerName={(name) => updateStats((p) => ({ ...p, playerName: name }))}
          onClose={() => setScreen('menu')}
        />
      )}

      {screen === 'missions' && (
        <MissionsModal
          stats={stats}
          onClaimReward={handleClaimMission}
          onClose={() => setScreen('menu')}
        />
      )}

      {screen === 'profile' && (
        <ProfileModal
          stats={stats}
          onUpdateStats={(newSt) => updateStats((p) => ({ ...p, ...newSt }))}
          onClose={() => setScreen('menu')}
        />
      )}

      {screen === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setScreen('menu')}
        />
      )}

      {screen === 'how_to_play' && (
        <HowToPlayModal onClose={() => setScreen('menu')} />
      )}

      {/* Legal Footer Links */}
      {screen === 'menu' && (
        <nav
          id="legalLinks"
          aria-label="Legal information"
          className="fixed left-1/2 -translate-x-1/2 bottom-[max(8px,env(safe-area-inset-bottom,0px))] z-50 flex items-center justify-center gap-3 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/60 text-[10px] text-slate-400 whitespace-nowrap shadow-md pointer-events-auto"
        >
          <a
            href="privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-slate-600">•</span>
          <a
            href="terms.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            Terms of Service
          </a>
        </nav>
      )}
    </div>
  );
}

import React from 'react';
import { Volume2, VolumeX, Pause, RotateCcw, Smartphone, Shield, Zap, Magnet, Sun, Moon } from 'lucide-react';
import { PowerUpType } from '../types/game';
import { CoinIcon } from './CoinIcon';

interface HUDProps {
  score: number;
  bestScore: number;
  runCoins: number;
  totalCoins: number;
  lives: number;
  activePower: PowerUpType | null;
  powerTimeLeft: number;
  nearMissCombo: number;
  soundEnabled: boolean;
  tiltEnabled: boolean;
  isDayMode: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onRestart: () => void;
  onToggleTilt: () => void;
  onToggleDayNight: () => void;
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onJump: () => void;
  isRecovering: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  bestScore,
  runCoins,
  lives,
  activePower,
  powerTimeLeft,
  nearMissCombo,
  soundEnabled,
  tiltEnabled,
  isDayMode,
  onToggleSound,
  onPause,
  onRestart,
  onToggleTilt,
  onToggleDayNight,
  onSteerLeft,
  onSteerRight,
  onJump,
  isRecovering
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 select-none">
      {/* TOP DOCK: Brand, Stats, Day/Night & Active Power-Ups (Zero Viewport Occlusion!) */}
      <div className="flex flex-col gap-2 pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-start justify-between gap-2">
          {/* Brand & Lives */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isDayMode ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'}`}></span>
              <h1 className="font-game text-base md:text-lg font-black tracking-wider text-white drop-shadow-md">
                BOUNCE BALL <span className="text-amber-400">3D</span>
              </h1>
            </div>
            <p className={`text-[10px] tracking-widest font-semibold uppercase ${isDayMode ? 'text-sky-900 font-bold' : 'text-sky-300'}`}>
              Enemy Highway
            </p>

            {/* Lives Heart Icons */}
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3].map((heartIndex) => (
                <span
                  key={heartIndex}
                  className={`text-xl transition-all duration-300 ${
                    heartIndex <= lives
                      ? 'text-rose-500 scale-100 drop-shadow-[0_0_8px_#f43f5e]'
                      : 'text-slate-600 scale-75 opacity-30'
                  }`}
                >
                  ♥
                </span>
              ))}
            </div>
          </div>

          {/* Center Stats */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-center min-w-[55px] shadow-lg">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Score</span>
              <span className="block font-game text-base md:text-lg font-black text-white">{score.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-center min-w-[50px] shadow-lg">
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Best</span>
              <span className="block font-game text-sm md:text-base font-bold text-amber-300">{bestScore.toLocaleString()}</span>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-xl px-3 py-1.5 text-center min-w-[55px] shadow-lg">
              <span className="block text-[8px] uppercase tracking-wider text-amber-400 font-semibold">Coins</span>
              <span className="flex items-center justify-center gap-1 font-game text-base md:text-lg font-black text-amber-300">
                <CoinIcon size={16} />
                {runCoins}
              </span>
            </div>
          </div>

          {/* Top Control Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Day / Night Toggle */}
            <button
              onClick={onToggleDayNight}
              aria-label="Toggle Day / Night"
              className={`w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition-all shadow-md ${
                isDayMode
                  ? 'bg-amber-400/90 border-amber-300 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-slate-900/80 border-slate-700/70 text-sky-300'
              }`}
            >
              {isDayMode ? <Sun size={17} /> : <Moon size={16} />}
            </button>

            <button
              onClick={onToggleSound}
              aria-label="Toggle Sound"
              className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/70 text-slate-200 flex items-center justify-center active:scale-95 transition-all shadow-md"
            >
              {soundEnabled ? <Volume2 size={16} className="text-amber-400" /> : <VolumeX size={16} className="text-slate-400" />}
            </button>

            {/* Prominent, Highly Visible PAUSE Button */}
            <button
              onClick={onPause}
              aria-label="Pause Game"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-game font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.8)] border-2 border-amber-200 active:scale-95 transition-all cursor-pointer"
            >
              <Pause size={14} className="fill-slate-950 stroke-slate-950 stroke-[2.5]" />
              <span className="tracking-wider">PAUSE</span>
            </button>

            <button
              onClick={onRestart}
              aria-label="Reset"
              className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/70 text-slate-200 flex items-center justify-center active:scale-95 transition-all shadow-md"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* TOP STATUS ROW (Placed at the TOP so it NEVER blocks the ball or highway!) */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isRecovering && (
            <div className="bg-rose-600/90 text-white font-game text-[11px] font-black tracking-widest px-3.5 py-1 rounded-full shadow-[0_0_12px_#f43f5e] uppercase">
              ⚡ RECOVERING... (INVULNERABLE)
            </div>
          )}

          {nearMissCombo > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-game text-xs font-black px-3.5 py-1 rounded-full shadow-[0_0_15px_#f59e0b] tracking-wider animate-bounce">
              🎯 NEAR MISS! x{nearMissCombo} (+{nearMissCombo * 100})
            </div>
          )}

          {activePower && (
            <div className="bg-slate-900/95 border border-cyan-400/60 rounded-full px-3.5 py-1 flex items-center gap-2 shadow-lg backdrop-blur-md">
              {activePower === 'shield' && <Shield className="text-cyan-400 animate-pulse" size={15} />}
              {activePower === 'speed' && <Zap className="text-yellow-400 animate-pulse" size={15} />}
              {activePower === 'magnet' && <Magnet className="text-purple-400 animate-pulse" size={15} />}
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-200">
                {activePower === 'shield' ? 'SHIELD' : activePower === 'speed' ? 'SPEED' : 'MAGNET'}
              </span>
              <span className="font-game text-xs font-black text-amber-300">
                {powerTimeLeft.toFixed(1)}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONTROLS: Touch buttons, Swipe up/Tap to Jump & Tilt switch */}
      <div className="pb-[calc(env(safe-area-inset-bottom,0px)+10px)] flex flex-col items-center gap-2.5">
        {/* Swipe / Jump hint & trigger */}
        <div
          onClick={onJump}
          className="pointer-events-auto bg-slate-900/85 border border-slate-700/80 px-5 py-2 rounded-full text-slate-200 text-xs font-bold tracking-wider uppercase flex items-center gap-2 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          <span>⬆ DRAG OR TAP ARROWS • SWIPE UP TO JUMP</span>
        </div>

        {/* Steering dock */}
        <div className="w-full flex items-center justify-between px-2 pointer-events-auto">
          {/* Steer Left */}
          <button
            onPointerDown={onSteerLeft}
            aria-label="Steer Left"
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/95 border-2 border-slate-600/80 text-white font-game text-2xl font-black flex items-center justify-center active:bg-amber-500 active:text-slate-950 active:scale-95 transition-all shadow-2xl"
          >
            ◀
          </button>

          {/* Tilt Mode Toggle */}
          <button
            onClick={onToggleTilt}
            className={`px-4 h-14 rounded-2xl border-2 font-game font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all shadow-2xl active:scale-95 ${
              tiltEnabled
                ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_15px_#f59e0b]'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}
          >
            <Smartphone size={18} />
            <span className="tracking-wider">{tiltEnabled ? 'TILT ON' : 'TILT OFF'}</span>
          </button>

          {/* Steer Right */}
          <button
            onPointerDown={onSteerRight}
            aria-label="Steer Right"
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/95 border-2 border-slate-600/80 text-white font-game text-2xl font-black flex items-center justify-center active:bg-amber-500 active:text-slate-950 active:scale-95 transition-all shadow-2xl"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

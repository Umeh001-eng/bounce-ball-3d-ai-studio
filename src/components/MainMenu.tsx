import React from 'react';
import { Play, Trophy, ShoppingBag, Zap, Target, Settings, HelpCircle, User, Sun, Moon } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { CoinIcon } from './CoinIcon';

interface MainMenuProps {
  stats: PlayerStats;
  isDayMode: boolean;
  onToggleDayNight: () => void;
  onStartRun: () => void;
  onOpenBallShop: () => void;
  onOpenLavaShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenMissions: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  isDayMode,
  onToggleDayNight,
  onStartRun,
  onOpenBallShop,
  onOpenLavaShop,
  onOpenLeaderboard,
  onOpenMissions,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenProfile
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 overflow-y-auto pointer-events-auto bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/80">
      {/* Top Header: Player Profile Pill & Quick Stats */}
      <div className="flex items-center justify-between w-full pt-[env(safe-area-inset-top,0px)]">
        {/* Profile Card Pill */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-slate-900/85 border border-slate-700/80 hover:border-amber-400/80 px-3 py-1.5 rounded-2xl shadow-lg backdrop-blur-md active:scale-95 transition-all text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-md">
            {stats.avatar}
          </div>
          <div>
            <div className="font-game text-xs font-black text-white flex items-center gap-1">
              {stats.playerName}
              <User size={12} className="text-amber-400" />
            </div>
            <div className="text-[10px] text-slate-400">BEST: <span className="text-amber-300 font-bold">{stats.highScore.toLocaleString()}</span></div>
          </div>
        </button>

        {/* Center / Right controls: Day/Night Toggle & Coin Bank Pill */}
        <div className="flex items-center gap-2">
          {/* Day / Night Switch */}
          <button
            onClick={onToggleDayNight}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border font-game text-xs font-bold shadow-lg backdrop-blur-md active:scale-95 transition-all ${
              isDayMode
                ? 'bg-amber-400/90 border-amber-300 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                : 'bg-slate-900/85 border-slate-700 text-sky-300'
            }`}
          >
            {isDayMode ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDayMode ? 'DAY' : 'NIGHT'}</span>
          </button>

          {/* Coin Bank Pill */}
          <div className="flex items-center gap-2 bg-slate-900/85 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl shadow-lg backdrop-blur-md">
            <CoinIcon size={20} />
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-amber-400 font-bold">Wallet</span>
              <span className="font-game text-sm font-black text-amber-300">
                {stats.totalCoinsEarned.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="text-center my-auto py-6">
        <div className="inline-block relative">
          <span className="text-[11px] font-bold tracking-[0.35em] text-cyan-300 uppercase px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 mb-2 inline-block">
            High Velocity 3D Action
          </span>
          <h1 className="font-game text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            BOUNCE BALL <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">3D</span>
          </h1>
          <h2 className="font-game text-lg sm:text-xl font-bold tracking-[0.25em] text-rose-400 drop-shadow-[0_0_12px_#f43f5e] mt-1">
            ENEMY HIGHWAY
          </h2>
        </div>

        {/* Primary Play Button */}
        <div className="max-w-xs mx-auto mt-6">
          <button
            onClick={onStartRun}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-game text-lg font-black tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <Play size={22} fill="currentColor" />
            START HIGHWAY RUN
          </button>
        </div>
      </div>

      {/* Menu Action Grid */}
      <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
        {/* Standard Ball Shop */}
        <button
          onClick={onOpenBallShop}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-sky-500/30 hover:border-sky-400 active:scale-95 transition-all shadow-lg text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="font-game text-xs font-black text-white">BALL SHOP</div>
            <div className="text-[10px] text-sky-300">5 Unique Spheres</div>
          </div>
        </button>

        {/* God of Speed / Solar Hyperdrive Shop */}
        <button
          onClick={onOpenLavaShop}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/50 hover:border-yellow-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-900/50 border border-amber-400/60 flex items-center justify-center text-yellow-300 animate-pulse">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <div className="font-game text-xs font-black text-yellow-300">GOD OF SPEED</div>
            <div className="text-[10px] text-amber-200">Solar Hyperdrive</div>
          </div>
        </button>

        {/* Global Leaderboard */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 active:scale-95 transition-all shadow-lg text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy size={20} />
          </div>
          <div>
            <div className="font-game text-xs font-black text-white">LEADERBOARD</div>
            <div className="text-[10px] text-amber-300">Global Top 10</div>
          </div>
        </button>

        {/* Missions */}
        <button
          onClick={onOpenMissions}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-400 active:scale-95 transition-all shadow-lg text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Target size={20} />
          </div>
          <div>
            <div className="font-game text-xs font-black text-white">MISSIONS</div>
            <div className="text-[10px] text-emerald-300">Daily Rewards</div>
          </div>
        </button>

        {/* How to Play */}
        <button
          onClick={onOpenHowToPlay}
          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 hover:border-slate-500 active:scale-95 transition-all text-left"
        >
          <HelpCircle size={18} className="text-slate-400 ml-1" />
          <span className="font-game text-xs font-bold text-slate-300">HOW TO PLAY</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 hover:border-slate-500 active:scale-95 transition-all text-left"
        >
          <Settings size={18} className="text-slate-400 ml-1" />
          <span className="font-game text-xs font-bold text-slate-300">SETTINGS</span>
        </button>
      </div>
    </div>
  );
};

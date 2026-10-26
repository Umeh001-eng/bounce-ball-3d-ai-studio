import React, { useState } from 'react';
import { ArrowLeft, User, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { AVATARS } from '../utils/storage';
import { PlayerStats } from '../types/game';
import { getBallById } from '../game/ballCatalog';
import { CoinIcon } from './CoinIcon';

interface ProfileModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  stats,
  onUpdateStats,
  onClose
}) => {
  const [nameInput, setNameInput] = useState(stats.playerName);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.avatar);
  const equippedBall = getBallById(stats.equippedBall);

  const handleSave = () => {
    const trimmed = nameInput.trim().slice(0, 20) || 'HighwayStar';
    onUpdateStats({
      playerName: trimmed,
      avatar: selectedAvatar
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950/98 via-slate-900/95 to-slate-950/98 flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-500/30 pb-3 pt-[env(safe-area-inset-top,0px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-game text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          BACK
        </button>

        <div className="text-center">
          <h2 className="font-game text-xl font-black text-white tracking-wider flex items-center justify-center gap-1.5">
            <User size={18} className="text-amber-400" />
            PILOT PROFILE
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-sky-300 font-semibold">
            Highway Career Progression
          </span>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-game text-xs font-black uppercase shadow-md active:scale-95 transition-all"
        >
          SAVE
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full my-auto py-4 flex flex-col gap-4">
        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
            {selectedAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Callsign / Nickname
            </label>
            <input
              type="text"
              maxLength={20}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-game font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Avatar Selection Carousel */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs font-game font-bold text-slate-300 block mb-2">
            CHOOSE PILOT BADGE
          </span>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className={`h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                  selectedAvatar === av
                    ? 'bg-amber-400/20 border-2 border-amber-400 scale-105 shadow-[0_0_12px_#f59e0b]'
                    : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Career Stats Grid */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-game font-bold text-amber-300 mb-3">
            <Trophy size={16} /> LIFETIME HIGHWAY STATISTICS
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Best Score</span>
              <span className="font-game text-base font-black text-amber-300">{stats.highScore.toLocaleString()}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total Coins</span>
              <span className="font-game text-base font-black text-amber-300 flex items-center justify-center gap-1">
                <CoinIcon size={16} /> {stats.totalCoinsEarned.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Distance Traveled</span>
              <span className="font-game text-base font-black text-sky-400">{Math.floor(stats.totalDistance).toLocaleString()}m</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total Runs</span>
              <span className="font-game text-base font-black text-white">{stats.totalRuns}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Near Misses</span>
              <span className="font-game text-base font-black text-orange-400">{stats.totalNearMisses}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Spheres Owned</span>
              <span className="font-game text-base font-black text-emerald-400">{stats.ownedBalls.length} / 6</span>
            </div>
          </div>

          {/* Currently Equipped Sphere Info */}
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase block font-semibold">Equipped Sphere</span>
                <span className="font-game text-xs font-black text-white">{equippedBall.name}</span>
              </div>
            </div>
            <span
              className="text-[10px] font-game font-black px-2 py-0.5 rounded"
              style={{ backgroundColor: `${equippedBall.color}22`, color: equippedBall.color }}
            >
              {equippedBall.rarity}
            </span>
          </div>
        </div>

        {/* Data Persistence Note */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
          <span>Progression and coin balances are saved locally to your device.</span>
        </div>
      </div>
    </div>
  );
};

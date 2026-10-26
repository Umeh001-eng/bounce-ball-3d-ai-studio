import React from 'react';
import { ArrowLeft, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { INITIAL_MISSIONS } from '../utils/storage';
import { Mission, PlayerStats } from '../types/game';
import { CoinIcon } from './CoinIcon';

interface MissionsModalProps {
  stats: PlayerStats;
  onClaimReward: (mission: Mission) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  stats,
  onClaimReward,
  onClose
}) => {
  // Compute progress for each mission based on stats
  const getProgress = (mission: Mission): { current: number; isReady: boolean } => {
    let current = 0;
    switch (mission.id) {
      case 'm_coins_100':
        current = stats.totalCoinsEarned;
        break;
      case 'm_score_1000':
        current = stats.highScore;
        break;
      case 'm_survive_60':
        current = Math.min(mission.target, stats.totalDistance > 800 ? 60 : Math.floor(stats.totalDistance / 14));
        break;
      case 'm_jump_20':
        current = Math.min(mission.target, Math.floor(stats.totalDistance / 40));
        break;
      case 'm_near_miss_5':
        current = stats.totalNearMisses;
        break;
      case 'm_distance_2000':
        current = stats.totalDistance;
        break;
      case 'm_own_3_balls':
        current = stats.ownedBalls.length;
        break;
      case 'm_lava_glory':
        current = stats.totalCoinsEarned;
        break;
      default:
        current = 0;
    }
    return {
      current,
      isReady: current >= mission.target
    };
  };

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950/98 via-slate-900/95 to-slate-950/98 flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 pt-[env(safe-area-inset-top,0px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-game text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          BACK TO MENU
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400">
            <Target size={18} />
            <h2 className="font-game text-xl font-black text-emerald-400 tracking-wider">
              MISSIONS & ACHIEVEMENTS
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Complete Goals for Huge Coin Bounties
          </span>
        </div>

        {/* Coin Balance */}
        <div className="bg-emerald-950/60 border border-emerald-500/50 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg">
          <CoinIcon size={18} />
          <span className="font-game text-sm font-black text-amber-300">
            {stats.totalCoinsEarned.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Missions List */}
      <div className="max-w-xl mx-auto w-full my-auto py-4 flex flex-col gap-3">
        {INITIAL_MISSIONS.map((m) => {
          const isClaimed = stats.claimedMissions.includes(m.id);
          const { current, isReady } = getProgress(m);
          const percent = Math.min(100, Math.floor((current / m.target) * 100));

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                isClaimed
                  ? 'bg-slate-950/70 border-slate-800 opacity-60'
                  : isReady
                  ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-game text-xs font-black text-white truncate">
                      {m.title}
                    </h3>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                      {m.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {m.description}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isClaimed ? 'bg-slate-600' : isReady ? 'bg-emerald-400' : 'bg-sky-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1 font-semibold flex justify-between">
                    <span>{current.toLocaleString()} / {m.target.toLocaleString()}</span>
                    <span>{percent}%</span>
                  </div>
                </div>
              </div>

              {/* Reward Action */}
              <div className="flex-shrink-0 text-right">
                {isClaimed ? (
                  <div className="flex items-center gap-1 text-slate-500 font-game text-xs font-bold">
                    <CheckCircle2 size={16} /> CLAIMED
                  </div>
                ) : isReady ? (
                  <button
                    onClick={() => onClaimReward(m)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-game text-xs font-black tracking-wider uppercase active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>CLAIM</span>
                    <CoinIcon size={14} />
                    <span>{m.rewardCoins}</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-game text-xs font-bold flex items-center gap-1">
                    <CoinIcon size={14} />
                    <span>{m.rewardCoins}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

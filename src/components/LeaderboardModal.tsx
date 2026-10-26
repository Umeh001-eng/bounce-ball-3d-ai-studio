import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, RotateCcw, Award } from 'lucide-react';
import { fetchTop10Leaderboard, submitScore, AVATAR_LIST } from '../utils/supabase';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardModalProps {
  currentScore: number;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentScore,
  playerName,
  onUpdatePlayerName,
  onClose
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [nameInput, setNameInput] = useState(playerName || '');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadScores = async () => {
    setLoading(true);
    setStatusMessage(null);
    const res = await fetchTop10Leaderboard();
    setEntries(res.entries);
    setIsLive(res.isLive);
    setLoading(false);
  };

  useEffect(() => {
    loadScores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setStatusMessage('Please enter a player nickname.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('Saving your score...');
    onUpdatePlayerName(nameInput.trim());

    const result = await submitScore(nameInput.trim(), currentScore);
    setStatusMessage(result.message);
    setSubmitting(false);

    if (result.success) {
      loadScores();
    }
  };

  const top3 = [entries[1], entries[0], entries[2]]; // 2nd, 1st, 3rd for podium layout

  return (
    <div className="absolute inset-0 z-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-950/95 via-slate-950/95 to-slate-950/98 flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 pt-[env(safe-area-inset-top,0px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-game text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          CLOSE
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400">
            <Trophy size={18} />
            <h2 className="font-game text-xl font-black text-amber-400 tracking-wider">
              GLOBAL TOP 10
            </h2>
            <Trophy size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-sky-300 font-semibold">
            {isLive ? 'Verified Worldwide Rankings' : 'Local Demo Ranking (Offline)'}
          </span>
        </div>

        <button
          onClick={loadScores}
          className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-95 transition-all"
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-xl mx-auto w-full my-auto py-4 flex flex-col gap-4">
        {/* Score Submission Form if currentScore > 0 */}
        {currentScore > 0 && (
          <form
            onSubmit={handleSubmit}
            className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-game font-bold text-amber-300 flex items-center gap-1">
                <Award size={14} /> SUBMIT RECENT SCORE: {currentScore.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Max 20 chars</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                maxLength={20}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your player nickname"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-game text-xs font-black tracking-wider uppercase active:scale-95 transition-all disabled:opacity-60 shadow-md"
              >
                {submitting ? 'SAVING...' : 'SAVE SCORE'}
              </button>
            </div>

            {statusMessage && (
              <p className="text-xs text-amber-300 font-semibold mt-2 text-center">
                {statusMessage}
              </p>
            )}
          </form>
        )}

        {/* Top 3 Podium Cards */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
            {/* 2nd Place */}
            {top3[0] && (
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-500/50 text-center flex flex-col items-center">
                <div className="text-[10px] font-game font-black text-slate-300 tracking-wider mb-1">
                  🥈 2ND
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-2xl shadow-md my-1">
                  {top3[0].avatar || AVATAR_LIST[1]}
                </div>
                <div className="font-game text-xs font-bold text-white truncate max-w-full">
                  {top3[0].player_name}
                </div>
                <div className="font-game text-sm font-black text-slate-300 mt-1">
                  {Number(top3[0].score).toLocaleString()}
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[1] && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/80 to-slate-900/90 border-2 border-amber-400 text-center flex flex-col items-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <div className="text-xs font-game font-black text-amber-300 tracking-wider mb-1">
                  👑 1ST CHAMPION
                </div>
                <div className="w-14 h-14 rounded-full bg-amber-500/30 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-lg my-1">
                  {top3[1].avatar || AVATAR_LIST[0]}
                </div>
                <div className="font-game text-sm font-black text-amber-300 truncate max-w-full">
                  {top3[1].player_name}
                </div>
                <div className="font-game text-base font-black text-amber-400 mt-1">
                  {Number(top3[1].score).toLocaleString()}
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-700/50 text-center flex flex-col items-center">
                <div className="text-[10px] font-game font-black text-amber-600 tracking-wider mb-1">
                  🥉 3RD
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-950/50 border-2 border-amber-700 flex items-center justify-center text-2xl shadow-md my-1">
                  {top3[2].avatar || AVATAR_LIST[2]}
                </div>
                <div className="font-game text-xs font-bold text-white truncate max-w-full">
                  {top3[2].player_name}
                </div>
                <div className="font-game text-sm font-black text-amber-500 mt-1">
                  {Number(top3[2].score).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4th - 10th Rows */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2 divide-y divide-slate-800/80 shadow-lg">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-xs font-game animate-pulse">
              LOADING WORLD RANKINGS...
            </div>
          ) : entries.slice(3, 10).map((entry, idx) => {
            const rank = idx + 4;
            return (
              <div key={idx} className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-game font-black text-xs text-amber-400">
                    #{rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-base">
                    {entry.avatar || AVATAR_LIST[rank % AVATAR_LIST.length]}
                  </div>
                  <div>
                    <span className="font-game text-xs font-bold text-white block">
                      {entry.player_name}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                      HIGHWAY PILOT
                    </span>
                  </div>
                </div>

                <span className="font-game text-sm font-black text-amber-300">
                  {Number(entry.score).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

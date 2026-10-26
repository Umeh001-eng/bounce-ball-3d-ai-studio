import React, { useState } from 'react';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { submitScore } from '../utils/supabase';
import { CoinIcon } from './CoinIcon';

interface GameOverModalProps {
  score: number;
  coins: number;
  distance: number;
  nearMisses: number;
  bestScore: number;
  isNewHigh: boolean;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coins,
  distance,
  nearMisses,
  bestScore,
  isNewHigh,
  playerName,
  onUpdatePlayerName,
  onRestart,
  onHome
}) => {
  const [nameInput, setNameInput] = useState(playerName || '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || submitted || submitting) return;

    setSubmitting(true);
    setStatusMsg('Saving score...');
    onUpdatePlayerName(nameInput.trim());

    const res = await submitScore(nameInput.trim(), score);
    setSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      setStatusMsg(`✅ ${res.message}`);
    } else {
      setStatusMsg(`❌ ${res.message}`);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-amber-500/50 rounded-3xl p-5 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center my-auto">
        {/* Banner */}
        {isNewHigh ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-game text-xs font-black tracking-widest uppercase mb-2 shadow-[0_0_15px_#f59e0b]">
            <Sparkles size={14} /> NEW RECORD HIGH SCORE!
          </div>
        ) : (
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase block mb-1">
            RUN TERMINATED
          </span>
        )}

        <h2 className="font-game text-3xl font-black text-white tracking-wide">
          RUN OVER
        </h2>

        {/* Big Score Box */}
        <div className="my-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
            Final Score
          </span>
          <span className="font-game text-4xl font-black text-amber-300">
            {score.toLocaleString()}
          </span>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
            <div>
              <span className="text-[9px] uppercase text-slate-400 block">Coins</span>
              <span className="font-game text-sm font-bold text-amber-300 flex items-center justify-center gap-1">
                <CoinIcon size={14} /> +{coins}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-slate-400 block">Distance</span>
              <span className="font-game text-sm font-bold text-sky-400">{distance}m</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-slate-400 block">Near Miss</span>
              <span className="font-game text-sm font-bold text-orange-400">x{nearMisses}</span>
            </div>
          </div>
        </div>

        {/* Global Leaderboard Submission Form */}
        <div className="my-3 p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 text-left">
          <div className="flex items-center justify-between text-xs font-game font-bold text-amber-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Trophy size={15} /> GLOBAL TOP 10 SUBMISSION
            </span>
            <span className="text-[10px] text-slate-400">All-Time Best: {bestScore.toLocaleString()}</span>
          </div>

          {!submitted ? (
            <form onSubmit={handleSaveScore} className="space-y-2">
              <input
                type="text"
                maxLength={20}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter player nickname (1-20 chars)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-game"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-game text-xs font-black tracking-wider uppercase active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                {submitting ? 'RECORDING SCORE...' : 'SAVE TO GLOBAL TOP 10'}
              </button>
            </form>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-game font-bold text-center">
              ✓ SCORE SUCCESSFULLY RECORDED!
            </div>
          )}

          {statusMsg && !submitted && (
            <p className="text-[11px] text-amber-300 font-semibold mt-1.5 text-center">
              {statusMsg}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-game text-sm font-black tracking-wider uppercase active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            PLAY AGAIN
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-game text-xs font-bold tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-800"
          >
            <Home size={15} />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

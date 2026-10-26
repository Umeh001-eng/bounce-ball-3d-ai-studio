import React from 'react';
import { Play, RotateCcw, Home, ShoppingBag } from 'lucide-react';
import { CoinIcon } from './CoinIcon';

interface PauseModalProps {
  score: number;
  coins: number;
  onResume: () => void;
  onRestart: () => void;
  onOpenShop: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  coins,
  onResume,
  onRestart,
  onOpenShop,
  onHome
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-center">
        <h2 className="font-game text-2xl font-black text-white tracking-wide mb-1">
          GAME PAUSED
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-4">
          Catch your breath
        </span>

        {/* Current Run Snapshot */}
        <div className="flex justify-around bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-5">
          <div>
            <span className="text-[9px] text-slate-400 block uppercase">Current Score</span>
            <span className="font-game text-base font-black text-white">{score.toLocaleString()}</span>
          </div>
          <div className="border-r border-slate-800"></div>
          <div>
            <span className="text-[9px] text-slate-400 block uppercase">Coins Earned</span>
            <span className="font-game text-base font-black text-amber-300 flex items-center justify-center gap-1">
              <CoinIcon size={16} /> {coins}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-game text-sm font-black tracking-wider uppercase active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            RESUME RUN
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-game text-xs font-bold tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} />
            RESTART RUN
          </button>

          <button
            onClick={onOpenShop}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-game text-xs font-bold tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={15} />
            BALL SHOP
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-game text-xs font-bold tracking-wider uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home size={15} />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

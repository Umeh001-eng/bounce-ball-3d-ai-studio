import React from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { STANDARD_BALLS } from '../game/ballCatalog';
import { BallItem } from '../types/game';
import { CoinIcon } from './CoinIcon';

interface BallShopProps {
  coins: number;
  ownedBalls: string[];
  equippedBall: string;
  onBuyBall: (ball: BallItem) => void;
  onEquipBall: (ball: BallItem) => void;
  onClose: () => void;
}

export const BallShop: React.FC<BallShopProps> = ({
  coins,
  ownedBalls,
  equippedBall,
  onBuyBall,
  onEquipBall,
  onClose
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950/98 via-slate-900/95 to-slate-950/98 flex flex-col p-4 overflow-y-auto">
      {/* Shop Header */}
      <div className="flex items-center justify-between border-b border-sky-500/20 pb-3 pt-[env(safe-area-inset-top,0px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-game text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          BACK TO MENU
        </button>

        <div className="text-center">
          <h2 className="font-game text-xl font-black text-sky-400 tracking-wider">
            STANDARD BALL SHOP
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-slate-400">
            Precision Highway Spheres
          </span>
        </div>

        {/* Coin Balance */}
        <div className="bg-amber-950/60 border border-amber-500/50 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg">
          <CoinIcon size={20} />
          <span className="font-game text-sm font-black text-amber-300">
            {coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Info Notice */}
      <div className="my-3 p-2.5 rounded-xl bg-slate-900/60 border border-sky-500/20 text-center text-xs text-sky-200 flex items-center justify-center gap-1.5">
        <CoinIcon size={16} /> Purchases use gameplay coins only. Upgrades persist permanently on your profile.
      </div>

      {/* Ball Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-auto max-w-4xl mx-auto w-full pb-6">
        {STANDARD_BALLS.map((ball) => {
          const isOwned = ownedBalls.includes(ball.id);
          const isEquipped = equippedBall === ball.id;
          const canAfford = coins >= ball.price;

          return (
            <div
              key={ball.id}
              className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${
                isEquipped
                  ? 'bg-slate-900/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                  : isOwned
                  ? 'bg-slate-900/70 border-sky-500/40 hover:border-sky-400'
                  : 'bg-slate-950/80 border-slate-800 opacity-90 hover:opacity-100'
              }`}
            >
              {/* Rarity & Power Badge */}
              <div className="w-full flex items-center justify-between text-[10px] font-bold tracking-wider mb-2">
                <span
                  className="px-2 py-0.5 rounded-md font-game"
                  style={{ backgroundColor: `${ball.color}22`, color: ball.color }}
                >
                  {ball.rarity}
                </span>
                <span className="text-amber-400">
                  {'★'.repeat(ball.power)}{'☆'.repeat(5 - ball.power)}
                </span>
              </div>

              {/* Ball Visual Preview Sphere */}
              <div
                className="w-20 h-20 rounded-full my-2 relative flex items-center justify-center shadow-xl transition-transform duration-500 hover:rotate-12 hover:scale-105"
                style={{
                  background: ball.texturePath
                    ? `radial-gradient(circle at 35% 30%, #ffffff88 0%, transparent 60%), url(${ball.texturePath}) center/cover`
                    : `radial-gradient(circle at 30% 25%, #ffffff 0%, ${ball.color} 45%, #050b18 100%)`,
                  boxShadow: `0 0 18px ${ball.color}55, inset -4px -4px 12px #000000aa`
                }}
              >
                <div className="absolute top-2 left-3 w-4 h-2.5 rounded-full bg-white/70 rotate-[-25deg] blur-[1px]"></div>
              </div>

              {/* Title & Info */}
              <h3 className="font-game text-base font-black text-white mt-2 tracking-wide text-center">
                {ball.name}
              </h3>
              <p className="text-[11px] text-slate-400 text-center mb-1 line-clamp-1">
                {ball.subtitle}
              </p>
              <p className="text-[10px] font-semibold text-amber-300 text-center mb-3">
                {ball.effectDescription}
              </p>

              {/* Jump & Boost indicators */}
              <div className="w-full grid grid-cols-2 gap-1.5 text-[9px] uppercase bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80 mb-3 text-slate-300">
                <div className="text-center">
                  <span className="text-slate-500 block">Jump Power</span>
                  <span className="font-bold text-sky-300">{ball.jumpPower}m/s</span>
                </div>
                <div className="text-center">
                  <span className="text-slate-500 block">Rebound</span>
                  <span className="font-bold text-amber-300">x{ball.bounceBoost}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full mt-auto">
                {isEquipped ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-game text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    EQUIPPED
                  </button>
                ) : isOwned ? (
                  <button
                    onClick={() => onEquipBall(ball)}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-game text-xs font-black tracking-wider uppercase active:scale-95 transition-all shadow-md"
                  >
                    EQUIP SPHERE
                  </button>
                ) : (
                  <button
                    onClick={() => onBuyBall(ball)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl font-game text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles size={13} />
                    <CoinIcon size={16} />
                    <span>{ball.price.toLocaleString()}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

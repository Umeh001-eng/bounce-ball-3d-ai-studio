import React from 'react';
import { ArrowLeft, Zap, Check, Sparkles, ShieldAlert, Award } from 'lucide-react';
import { SOLAR_GOD_BALL, SOLAR_GOD_PRICE } from '../game/ballCatalog';
import { BallItem } from '../types/game';
import { CoinIcon } from './CoinIcon';

interface LavaShopProps {
  coins: number;
  ownedBalls: string[];
  equippedBall: string;
  onBuyBall: (ball: BallItem) => void;
  onEquipBall: (ball: BallItem) => void;
  onClose: () => void;
}

export const LavaShop: React.FC<LavaShopProps> = ({
  coins,
  ownedBalls,
  equippedBall,
  onBuyBall,
  onEquipBall,
  onClose
}) => {
  const isOwned = ownedBalls.includes(SOLAR_GOD_BALL.id);
  const isEquipped = equippedBall === SOLAR_GOD_BALL.id;
  const canAfford = coins >= SOLAR_GOD_PRICE;
  const progressPercent = Math.min(100, Math.floor((coins / SOLAR_GOD_PRICE) * 100));

  return (
    <div className="absolute inset-0 z-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/95 via-yellow-950/90 to-slate-950/98 flex flex-col p-4 overflow-y-auto">
      {/* Solar Sparks Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-3 pt-[env(safe-area-inset-top,0px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/60 text-amber-200 font-game text-xs font-bold active:scale-95 transition-all shadow-lg"
        >
          <ArrowLeft size={16} />
          BACK TO MENU
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400">
            <Zap size={20} className="animate-pulse" />
            <h2 className="font-game text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 tracking-widest drop-shadow-[0_0_12px_#f59e0b]">
              GOD OF SPEED SHOP
            </h2>
            <Zap size={20} className="animate-pulse" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-amber-300/80 font-bold">
            The Solar Hyperdrive Chamber
          </span>
        </div>

        {/* Coin Balance */}
        <div className="bg-slate-950/90 border border-amber-500/60 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <CoinIcon size={20} />
          <span className="font-game text-sm font-black text-amber-300">
            {coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="relative z-10 max-w-xl mx-auto my-auto w-full py-4 flex flex-col items-center">
        {/* Animated Solar Sphere Visualizer */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Radial Solar Aura */}
          <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-orange-500/20 blur-2xl animate-pulse"></div>

          {/* 3D Molten Gold Cyber Sphere */}
          <div
            className="w-40 h-40 md:w-48 md:h-48 rounded-full relative shadow-[0_0_50px_#ffd700,inset_-8px_-8px_25px_#000000] border-2 border-yellow-300/90 flex items-center justify-center transition-transform duration-700 hover:rotate-45 hover:scale-105"
            style={{
              background: `radial-gradient(circle at 35% 30%, #ffffff88 0%, transparent 60%), url('/assets/aistudio/8B0586A1-5445-480E-9475-948EADC87DE1_0e76a0bc.png') center/cover`,
              boxShadow: '0 0 50px rgba(255, 215, 0, 0.7), inset 0 0 25px rgba(255, 255, 255, 0.6)'
            }}
          >
            {/* Solar Flare Hotspot */}
            <div className="absolute top-4 left-6 w-9 h-6 rounded-full bg-white/70 blur-[2px] rotate-[-20deg]"></div>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center mt-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 font-game text-xs font-black tracking-widest uppercase mb-1">
            <Award size={14} /> SUPREME GOD TIER
          </div>
          <h1 className="font-game text-2xl md:text-3xl font-black text-white tracking-wider drop-shadow-[0_2px_10px_#000]">
            SOLAR HYPERDRIVE
          </h1>
          <h2 className="font-game text-sm font-bold tracking-[0.2em] text-amber-300">
            GOD OF SPEED — THE GOLDEN EMPEROR
          </h2>
          <p className="text-xs text-amber-100/90 max-w-md mx-auto mt-2 leading-relaxed px-4">
            The supreme ruler of highway velocity. Forged with radiant golden neon conduits, light-speed supersonic shockwaves, and infinite air vaulting.
          </p>
        </div>

        {/* Exclusive God-Tier Perks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full mt-4 text-[11px] font-bold">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-center">
            <span className="text-amber-400 block text-[9px] uppercase">Supersonic Vault</span>
            <span className="text-white">Active (Double Jump)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-center">
            <span className="text-amber-400 block text-[9px] uppercase">Jump Velocity</span>
            <span className="text-amber-300">15.0 m/s (Supreme)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-center col-span-2 sm:col-span-1">
            <span className="text-amber-400 block text-[9px] uppercase">Landing Impact</span>
            <span className="text-yellow-400">Solar Shockwave</span>
          </div>
        </div>

        {/* Coin Progress Bar */}
        <div className="w-full mt-5 bg-slate-950/90 border border-amber-500/40 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-xs font-game font-bold mb-2">
            <span className="text-amber-300 flex items-center gap-1">
              <Sparkles size={14} /> UNLOCK PROGRESS
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              <CoinIcon size={14} />
              {coins.toLocaleString()} / {SOLAR_GOD_PRICE.toLocaleString()} COINS
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-amber-950 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 transition-all duration-500 shadow-[0_0_12px_#f59e0b]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
            <span>{progressPercent}% Complete</span>
            <span>Earned via gameplay runs</span>
          </div>
        </div>

        {/* Buy / Equip CTA */}
        <div className="w-full mt-5">
          {isEquipped ? (
            <button
              disabled
              className="w-full py-4 rounded-2xl bg-amber-600/20 border-2 border-amber-400/60 text-amber-300 font-game text-base font-black tracking-widest uppercase flex items-center justify-center gap-2"
            >
              <Check size={20} />
              EQUIPPED IN HIGHWAY
            </button>
          ) : isOwned ? (
            <button
              onClick={() => onEquipBall(SOLAR_GOD_BALL)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-game text-base font-black tracking-widest uppercase shadow-[0_0_30px_#ffd700] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              EQUIP SOLAR HYPERDRIVE
            </button>
          ) : (
            <button
              onClick={() => onBuyBall(SOLAR_GOD_BALL)}
              disabled={!canAfford}
              className={`w-full py-4 rounded-2xl font-game text-base font-black tracking-widest uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl ${
                canAfford
                  ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_30px_#ffd700] hover:brightness-110'
                  : 'bg-slate-900 border border-amber-950 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap size={20} />
              {canAfford ? (
                <span className="flex items-center gap-1.5">
                  UNLOCK WITH <CoinIcon size={18} /> {SOLAR_GOD_PRICE.toLocaleString()}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  LOCKED • NEED <CoinIcon size={16} /> {(SOLAR_GOD_PRICE - coins).toLocaleString()} MORE
                </span>
              )}
            </button>
          )}
        </div>

        {/* Free-to-play guarantee note */}
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80 mt-3 font-semibold text-center">
          <ShieldAlert size={14} />
          <span>100% Obtainable through gameplay coins. No real money required!</span>
        </div>
      </div>
    </div>
  );
};

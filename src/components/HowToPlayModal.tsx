import React from 'react';
import { ArrowLeft, HelpCircle, Shield, Zap, Magnet, Heart, Flame } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
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
            <HelpCircle size={18} className="text-amber-400" />
            HOW TO PLAY
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-sky-300 font-semibold">
            Highway Pilot Field Manual
          </span>
        </div>

        <div className="w-16"></div>
      </div>

      <div className="max-w-xl mx-auto w-full my-auto py-4 flex flex-col gap-3">
        {/* Steering & Jumping */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <h3 className="font-game text-sm font-black text-amber-300 mb-1.5">
            1. STEERING & JUMPING
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            • Tap the <strong className="text-white">◀</strong> and <strong className="text-white">▶</strong> on-screen buttons, or swipe horizontally to switch across the 3 highway lanes.<br />
            • Swipe upward or tap <strong className="text-white">TAP TO JUMP</strong> to leap over barriers.<br />
            • Mythic balls and the <strong className="text-orange-400">GOD OF LAVA</strong> can double-jump mid-air!
          </p>
        </div>

        {/* Enemies */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-900/40">
          <div className="flex items-center gap-1.5 font-game text-sm font-black text-rose-400 mb-1.5">
            <Flame size={16} /> 2. RED ENEMY BALLS
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Three ruthless red pursuit balls hunt you along the highway: Brimstone, Viper, and Goliath. They track your lane and charge from behind. Watch for telegraph movements and weave into the open lane.
          </p>
        </div>

        {/* Lives & Near Misses */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 font-game text-sm font-black text-amber-400 mb-1.5">
            <Heart size={16} className="text-rose-500" /> 3. THREE LIVES & NEAR-MISS COMBOS
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You start each run with 3 hearts. Colliding with a barrier or enemy burns 1 life and grants 2.8s of temporary invulnerability (flashing). Squeezing within inches of hazards triggers <strong className="text-amber-300">NEAR MISS</strong> combos for huge score multipliers!
          </p>
        </div>

        {/* Power-Ups */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <h3 className="font-game text-sm font-black text-cyan-300 mb-2">
            4. POWER-UP ARSENAL
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-slate-950 p-2 rounded-xl border border-sky-500/30">
              <Shield className="text-sky-400 mx-auto mb-1" size={18} />
              <strong className="block text-white">Shield</strong>
              <span className="text-slate-400">Absorbs 1 lethal hit</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-yellow-500/30">
              <Zap className="text-yellow-400 mx-auto mb-1" size={18} />
              <strong className="block text-white">Hyper Speed</strong>
              <span className="text-slate-400">Warps forward fast</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-purple-500/30">
              <Magnet className="text-purple-400 mx-auto mb-1" size={18} />
              <strong className="block text-white">Coin Magnet</strong>
              <span className="text-slate-400">Drags all coins to you</span>
            </div>
          </div>
        </div>

        {/* Coins & Economy */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <h3 className="font-game text-sm font-black text-amber-300 mb-1.5">
            5. SEPARATE ECONOMY & BOTH SHOPS
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your run score and coin wallet are completely distinct. Collect coins during runs to unlock balls in the Standard Shop, and save up 100,000 gameplay coins to crown yourself with the mythical <strong className="text-orange-400">GOD OF LAVA</strong>!
          </p>
        </div>
      </div>
    </div>
  );
};

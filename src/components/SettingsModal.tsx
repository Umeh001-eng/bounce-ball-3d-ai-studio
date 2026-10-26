import React from 'react';
import { ArrowLeft, Settings, Volume2, Smartphone, Eye, Vibrate, Sun, Moon } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950/98 via-slate-900/95 to-slate-950/98 flex flex-col p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 pt-[env(safe-area-inset-top,0px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-game text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          BACK
        </button>

        <div className="text-center">
          <h2 className="font-game text-xl font-black text-white tracking-wider flex items-center justify-center gap-1.5">
            <Settings size={18} className="text-amber-400" />
            SETTINGS & ACCESSIBILITY
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            Audio, Motion & Visual Preferences
          </span>
        </div>

        <div className="w-16"></div>
      </div>

      <div className="max-w-xl mx-auto w-full my-auto py-4 flex flex-col gap-4">
        {/* Environment & Time of Day */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-game font-bold text-amber-300">
            <Sun size={16} /> HIGHWAY ENVIRONMENT & LIGHTING
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-200 block font-semibold">Time of Day</span>
              <span className="text-[10px] text-slate-400">Switch between bright sunny day and neon midnight city</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleChange('timeOfDay', 'day')}
                className={`px-3 py-1.5 rounded-xl font-game text-xs font-black flex items-center gap-1.5 transition-all ${
                  settings.timeOfDay === 'day'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <Sun size={14} /> DAY
              </button>
              <button
                onClick={() => handleChange('timeOfDay', 'night')}
                className={`px-3 py-1.5 rounded-xl font-game text-xs font-black flex items-center gap-1.5 transition-all ${
                  settings.timeOfDay === 'night'
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_12px_#0284c7]'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <Moon size={14} /> NIGHT
              </button>
            </div>
          </div>
        </div>
        {/* Audio Section */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-game font-bold text-sky-400">
            <Volume2 size={16} /> AUDIO SYNTHESIZER
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Master Sound</span>
            <button
              onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
              className={`px-3 py-1 rounded-xl font-game text-xs font-black transition-all ${
                settings.soundEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Music Volume</span>
              <span className="font-bold text-amber-300">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleChange('musicVolume', parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Sound Effects (SFX)</span>
              <span className="font-bold text-amber-300">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Controls & Gyro Tilt Section */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-game font-bold text-amber-400">
            <Smartphone size={16} /> STEERING & SENSORS
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 block">Device Tilt Steering</span>
              <span className="text-[10px] text-slate-500">Requires mobile gyroscope permission</span>
            </div>
            <button
              onClick={() => handleChange('tiltEnabled', !settings.tiltEnabled)}
              className={`px-3 py-1 rounded-xl font-game text-xs font-black transition-all ${
                settings.tiltEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.tiltEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {settings.tiltEnabled && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Tilt Sensitivity</span>
                <span className="font-bold text-amber-300">{settings.tiltSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.tiltSensitivity}
                onChange={(e) => handleChange('tiltSensitivity', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Visuals & Haptics Section */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-game font-bold text-purple-400">
            <Eye size={16} /> GRAPHICS & HAPTICS
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Graphics Quality</span>
            <div className="flex gap-1">
              {(['high', 'medium', 'low'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleChange('graphicsQuality', q)}
                  className={`px-2.5 py-1 rounded-lg font-game text-[10px] font-bold uppercase transition-all ${
                    settings.graphicsQuality === q
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Vibrate size={15} />
              <span>Vibration Feedback</span>
            </div>
            <button
              onClick={() => handleChange('vibrationEnabled', !settings.vibrationEnabled)}
              className={`px-3 py-1 rounded-xl font-game text-xs font-black transition-all ${
                settings.vibrationEnabled ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.vibrationEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Web Audio API procedural synthesizer for Bounce Ball 3D.
 * 100% self-contained, zero external audio files / zero 404s.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private musicStep = 0;
  private isMusicPlaying = false;
  private soundEnabled = true;
  private musicVolume = 0.6;
  private sfxVolume = 0.8;

  constructor() {
    // Initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateSettings(soundEnabled: boolean, musicVol: number, sfxVol: number) {
    this.soundEnabled = soundEnabled;
    this.musicVolume = Math.max(0, Math.min(1, musicVol));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVol));

    if (!this.soundEnabled) {
      this.stopMusic();
    }
  }

  public userInteractionTrigger() {
    this.initCtx();
  }

  public playTone(freq: number, duration = 0.1, type: OscillatorType = 'sine', vol = 0.05, delay = 0) {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      const targetVol = vol * this.sfxVolume;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, targetVol), t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.03);
    } catch {
      // Audio fallback gracefully
    }
  }

  public jump(isDoubleJump = false, isLava = false) {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Mario-style spring pitch glide upward
      osc.type = isLava ? 'sawtooth' : 'triangle';
      const startFreq = isDoubleJump ? 280 : (isLava ? 160 : 180);
      const endFreq = isDoubleJump ? 740 : (isLava ? 480 : 540);
      const dur = isDoubleJump ? 0.18 : 0.14;

      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);

      const targetVol = 0.08 * this.sfxVolume;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(targetVol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);

      // Extra harmonic layer for richness
      if (isDoubleJump) {
        this.playTone(880, 0.12, 'sine', 0.04, 0.04);
      }
    } catch {}
  }

  public land(isLava = false) {
    if (isLava) {
      this.playTone(85, 0.22, 'sawtooth', 0.1);
      this.playTone(130, 0.18, 'triangle', 0.07, 0.02);
      return;
    }
    this.playTone(110, 0.09, 'triangle', 0.07);
  }

  public coin() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Authentic Super Mario classic coin chime:
      // Note 1: B5 (987.77 Hz) for 0.05s
      // Note 2: E6 (1318.51 Hz) sustained for 0.28s with pure bright bell tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, t);

      const vol = 0.08 * this.sfxVolume;
      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(vol, t + 0.006);
      gain1.gain.setValueAtTime(vol, t + 0.045);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.075);

      // Second higher note (E6)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, t + 0.05);

      gain2.gain.setValueAtTime(0.0001, t);
      gain2.gain.setValueAtTime(0.0001, t + 0.048);
      gain2.gain.linearRampToValueAtTime(vol * 1.1, t + 0.056);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.048);
      osc2.stop(t + 0.34);
    } catch {}
  }

  public nearMiss() {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Arcade near miss whoosh + high ding
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.16);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.07 * this.sfxVolume, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);

      this.playTone(1760, 0.12, 'sine', 0.05, 0.08);
    } catch {}
  }

  public powerUp() {
    // Classic 1-UP / Super Star style upbeat arpeggio
    const notes = [329.63, 392.00, 659.25, 523.25, 587.33, 783.99]; // E4, G4, E5, C5, D5, G5
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.12, 'triangle', 0.06, idx * 0.05);
    });
  }

  public hit(isEnemy = false) {
    if (!this.soundEnabled || this.sfxVolume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isEnemy ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(isEnemy ? 180 : 120, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.28);

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch {}
  }

  public shieldBreak() {
    this.playTone(800, 0.1, 'triangle', 0.08);
    this.playTone(350, 0.2, 'sawtooth', 0.09, 0.05);
  }

  public buttonClick() {
    this.playTone(600, 0.04, 'sine', 0.04);
  }

  public purchase() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.playTone(n, 0.15, 'triangle', 0.08, i * 0.07));
  }

  public lavaRumble() {
    this.playTone(60, 0.4, 'sawtooth', 0.12);
    this.playTone(90, 0.35, 'triangle', 0.08, 0.05);
  }

  private kick(t: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

    const kickVol = 0.18 * this.musicVolume;
    gain.gain.setValueAtTime(kickVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  private snare(t: number) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    const snareVol = 0.07 * this.musicVolume;
    gain.gain.setValueAtTime(snareVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  public startMusic() {
    if (!this.soundEnabled || this.musicVolume <= 0 || this.isMusicPlaying) return;
    this.initCtx();
    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Driving dynamic electronic progression in A-minor / D-minor
    const melody = [
      440.00, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25,
      440.00, 523.25, 880.00, 783.99, 659.25, 587.33, 523.25, 493.88
    ];
    const bass = [
      110.00, 110.00, 130.81, 130.81, 98.00, 98.00, 123.47, 123.47
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.soundEnabled || !this.isMusicPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      const step = this.musicStep++ % 16;

      // 4/4 Beat: kick on 0, 4, 8, 12; snare on 4, 12
      if (step % 4 === 0) {
        this.kick(t);
      }
      if (step % 8 === 4) {
        this.snare(t);
      }

      // Bassline
      if (step % 2 === 0) {
        const bassFreq = bass[(step / 2) % bass.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, t);

        const bVol = 0.035 * this.musicVolume;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(bVol, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      }

      // Synth melody
      const melFreq = melody[step];
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.type = 'square';
      mOsc.frequency.setValueAtTime(melFreq, t);

      const mVol = 0.016 * this.musicVolume;
      mGain.gain.setValueAtTime(0.001, t);
      mGain.gain.exponentialRampToValueAtTime(mVol, t + 0.01);
      mGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.12);

      mOsc.connect(mGain);
      mGain.connect(this.ctx.destination);
      mOsc.start(t);
      mOsc.stop(t + 0.14);
    }, 145);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new SoundEngine();

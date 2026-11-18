/**
 * Procedural WebAudio synthesizer for Stack Panic.
 * Zero external audio files; unlocks on first user gesture.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private ambientTimer: number | null = null;
  private ambientStep = 0;

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(m ? 0 : 0.35, this.ctx.currentTime, 0.02);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  unlock(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.35;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  startAmbient(): void {
    if (this.ambientTimer !== null) return;
    const notes = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 440.0, 392.0];
    this.ambientTimer = window.setInterval(() => {
      if (this.muted || !this.ctx || !this.masterGain || this.ctx.state !== 'running') return;
      const freq = notes[this.ambientStep % notes.length];
      this.ambientStep++;
      this.playTone(freq, 0.14, 'triangle', 0.06, freq * 1.005);
    }, 340);
  }

  stopAmbient(): void {
    if (this.ambientTimer !== null) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  private playTone(
    freqStart: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    freqEnd?: number,
    delay = 0
  ): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playJump(): void {
    this.playTone(260, 0.14, 'sine', 0.28, 560);
  }

  playLand(): void {
    this.playTone(150, 0.08, 'triangle', 0.25, 75);
    this.playTone(320, 0.05, 'sine', 0.12, 240, 0.02);
  }

  playPickup(): void {
    this.playTone(523.25, 0.09, 'sine', 0.22, 659.25);
    this.playTone(659.25, 0.11, 'sine', 0.22, 783.99, 0.06);
  }

  playDangerWobble(): void {
    this.playTone(340, 0.12, 'sawtooth', 0.09, 260);
  }

  playTrapTrigger(): void {
    this.playTone(480, 0.10, 'square', 0.14, 190);
  }

  playTrapTelegraph(): void {
    this.playTone(620, 0.08, 'triangle', 0.12, 720);
  }

  playControlsSwap(): void {
    this.playTone(440, 0.10, 'square', 0.14, 330);
    this.playTone(330, 0.14, 'square', 0.14, 520, 0.09);
  }

  playFailScatter(): void {
    this.playTone(220, 0.28, 'sawtooth', 0.24, 65);
    this.playTone(420, 0.16, 'triangle', 0.20, 140, 0.04);
    this.playTone(580, 0.12, 'sine', 0.14, 210, 0.08);
  }

  playExplosion(): void {
    this.playTone(130, 0.36, 'sawtooth', 0.32, 32);
    this.playTone(90, 0.42, 'square', 0.22, 24, 0.02);
    this.playTone(310, 0.14, 'triangle', 0.16, 65, 0.03);
  }

  playWinChime(): void {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((f, idx) => {
      this.playTone(f, 0.22, 'triangle', 0.22, f * 1.01, idx * 0.075);
    });
  }

  playUiClick(): void {
    this.playTone(660, 0.05, 'sine', 0.15, 880);
  }
}

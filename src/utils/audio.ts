class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0,
    slideTo?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
      }
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Ignore audio failures when browser blocks autoplay
    }
  }

  public click() {
    this.playTone(520, 0.06, 'triangle', 0.06, 0, 620);
  }

  public bell() {
    this.playTone(1046.5, 0.35, 'sine', 0.09, 0);
    this.playTone(1568, 0.25, 'sine', 0.04, 0.01);
  }

  public collect() {
    this.playTone(660, 0.08, 'triangle', 0.07, 0);
    this.playTone(880, 0.12, 'triangle', 0.08, 0.06);
  }

  public upgrade() {
    this.playTone(392, 0.09, 'triangle', 0.08, 0);
    this.playTone(523.25, 0.09, 'triangle', 0.08, 0.07);
    this.playTone(659.25, 0.16, 'sine', 0.09, 0.14);
  }

  public discovery() {
    this.playTone(523.25, 0.12, 'sine', 0.08, 0);
    this.playTone(659.25, 0.12, 'sine', 0.08, 0.09);
    this.playTone(783.99, 0.14, 'sine', 0.08, 0.18);
    this.playTone(1046.5, 0.28, 'triangle', 0.09, 0.27);
  }

  public pneumatic() {
    this.playTone(240, 0.18, 'sine', 0.06, 0, 580);
  }
}

export const soundFX = new SoundEngine();

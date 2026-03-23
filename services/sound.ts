
class SoundService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public playClick() {
    if (!this.isEnabled || !this.audioContext) return;
    if (this.audioContext.state === 'suspended') this.audioContext.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  public playHover() {
    if (!this.isEnabled || !this.audioContext) return;
    if (this.audioContext.state === 'suspended') this.audioContext.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.01, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.03);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.03);
  }

  /**
   * playPremium: Sonido de 1.5s elegante y tecnológico.
   * Capa 1: Chispas rápidas (Arpegio FM sutil)
   * Capa 2: Tono campana fundamental (Ping limpio)
   * Capa 3: Aura armónica con eco
   */
  public playPremium() {
    if (!this.isEnabled || !this.audioContext) return;
    if (this.audioContext.state === 'suspended') this.audioContext.resume();

    const now = this.audioContext.currentTime;

    // --- CAPA 1: CHISPA INICIAL (Sparkle) ---
    [1200, 1600, 2000].forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (i * 0.03));
      gain.gain.setValueAtTime(0, now + (i * 0.03));
      gain.gain.linearRampToValueAtTime(0.03, now + (i * 0.03) + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.03) + 0.1);
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start(now + (i * 0.03));
      osc.stop(now + (i * 0.03) + 0.15);
    });

    // --- CAPA 2: CAMPANA NÚCLEO (The "Ping") ---
    const bell = this.audioContext.createOscillator();
    const bellGain = this.audioContext.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(523.25, now + 0.1); // C5
    bellGain.gain.setValueAtTime(0, now + 0.1);
    bellGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    bell.connect(bellGain);
    bellGain.connect(this.audioContext.destination);
    bell.start(now + 0.1);
    bell.stop(now + 1.5);

    // --- CAPA 3: AURA/ECO (Subtle Wash) ---
    const aura = this.audioContext.createOscillator();
    const auraGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    aura.type = 'triangle';
    aura.frequency.setValueAtTime(523.25 * 1.5, now + 0.15); // Armónico quinta
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(100, now + 1.5);
    filter.Q.value = 5;

    auraGain.gain.setValueAtTime(0, now + 0.15);
    auraGain.gain.linearRampToValueAtTime(0.02, now + 0.4);
    auraGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    aura.connect(filter);
    filter.connect(auraGain);
    auraGain.connect(this.audioContext.destination);
    aura.start(now + 0.15);
    aura.stop(now + 1.8);
  }
}

export const soundService = new SoundService();

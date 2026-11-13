/**
 * Looping soundtrack, served from `public/` in development and from the
 * R2-backed CDN in production (it exceeds the Pages per-file limit), loaded only when the visitor
 * first turns sound on and faded in and out instead of cutting abruptly.
 */

const SOUNDTRACK_FILE: string = encodeURIComponent("Interstellar by  Hans Zimmer.mp3");
const LOCAL_SOUNDTRACK: string = `${import.meta.env.BASE_URL}${SOUNDTRACK_FILE}`;
const CDN_SOUNDTRACK: string = `https://cdn.zerikapi.site/audio/${SOUNDTRACK_FILE}`;
const SOUNDTRACK_URL: string = import.meta.env.DEV ? LOCAL_SOUNDTRACK : CDN_SOUNDTRACK;
const DEFAULT_VOLUME: number = 0.6;
const VOLUME_KEY: string = "zerik.volume";
const FADE_MS: number = 1600;

function readStoredVolume(): number {
  try {
    const stored: number = Number(window.localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(stored) && stored > 0 && stored <= 1 ? stored : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

export class Soundtrack {
  private audio: HTMLAudioElement | null = null;
  private fadeFrame: number | null = null;
  private active: boolean = false;
  private level: number = readStoredVolume();

  get playing(): boolean {
    return this.active;
  }

  get volume(): number {
    return this.level;
  }

  /** Sets the listening volume in [0, 1] immediately and remembers it. */
  setVolume(volume: number): void {
    this.level = Math.min(1, Math.max(0, volume));
    try {
      window.localStorage.setItem(VOLUME_KEY, String(this.level));
    } catch {
      /* Private mode: the level simply is not remembered. */
    }
    if (!this.audio || !this.active) return;
    if (this.fadeFrame !== null) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
    this.audio.volume = this.level;
  }

  async start(): Promise<void> {
    const audio: HTMLAudioElement = this.audio ?? this.createAudio();
    this.active = true;
    await audio.play();
    this.fadeTo(this.level);
  }

  stop(): void {
    this.active = false;
    this.fadeTo(0, (): void => this.audio?.pause());
  }

  private createAudio(): HTMLAudioElement {
    const audio: HTMLAudioElement = new Audio(SOUNDTRACK_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    this.audio = audio;
    return audio;
  }

  private fadeTo(target: number, onDone?: () => void): void {
    const audio: HTMLAudioElement | null = this.audio;
    if (!audio) return;
    if (this.fadeFrame !== null) cancelAnimationFrame(this.fadeFrame);
    const from: number = audio.volume;
    const startedAt: number = performance.now();
    const step = (now: number): void => {
      const t: number = Math.min((now - startedAt) / FADE_MS, 1);
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * t));
      if (t < 1) {
        this.fadeFrame = requestAnimationFrame(step);
        return;
      }
      this.fadeFrame = null;
      onDone?.();
    };
    this.fadeFrame = requestAnimationFrame(step);
  }
}

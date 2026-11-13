export function clamp(value: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function smootherstep(t: number): number {
  const x: number = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Trapezoid window: 0 outside [a, d], 1 inside [b, c], linear ramps between. */
export function windowRamp(value: number, a: number, b: number, c: number, d: number): number {
  return clamp((value - a) / (b - a)) * clamp((d - value) / (d - c));
}

/** Frame-rate independent exponential smoothing factor. */
export function dampFactor(lambda: number, delta: number): number {
  return 1 - Math.exp(-lambda * delta);
}

/** Deterministic PRNG (mulberry32) so the universe looks the same on every visit. */
export function createRandom(seed: number): () => number {
  let state: number = seed >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t: number = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(text: string): number {
  let hash: number = 2166136261;
  for (let i: number = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

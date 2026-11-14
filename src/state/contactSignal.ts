/**
 * The contact transmission: clicking a channel shows a loader, flies the camera
 * to a satellite above Earth, beams a signal down to Colombia, opens the link
 * and flies back.
 *
 * The DOM side owns the timeline (`useContactSignal`); the scene reads the
 * elapsed time each frame and writes the camera pose into `cinematic`.
 */
import { Vector3 } from "three";
import { create } from "zustand";

import type { SocialLink } from "@/data/types";

export type SignalPhase = "idle" | "connecting" | "flight" | "returning";

/** Seconds of loader on the card before the camera leaves. */
export const CONNECT_SECONDS: number = 0.8;
/** Seconds of flight, measured from the end of the loader. */
export const FLIGHT_SECONDS: number = 3.2;
/** Flight beats, in seconds from the start of the flight. */
export const BEAM_STARTS: number = 1.2;
export const DIVE_STARTS: number = 2.0;
const RETURN_SECONDS: number = 1.4;
/** How long the page must keep focus after opening before we assume a blocked pop-up. */
const BLOCKED_CHECK_MS: number = 900;

/** Camera override written by the scene while the flight is on. */
export const cinematic: { active: boolean; readonly position: Vector3; readonly lookAt: Vector3 } = {
  active: false,
  position: new Vector3(),
  lookAt: new Vector3(),
};

interface ContactSignalStore {
  phase: SignalPhase;
  link: SocialLink | null;
  /** `performance.now()` when the current transmission started. */
  startedAt: number;
  /** Completed transmissions; from the second one on, the loader offers a skip. */
  plays: number;
  /** Link whose tab the browser seems to have blocked, offered as a plain link instead. */
  blocked: SocialLink | null;
  transmit: (link: SocialLink) => void;
  skip: () => void;
}

let timers: number[] = [];

function clearTimers(): void {
  timers.forEach((timer: number): void => window.clearTimeout(timer));
  timers = [];
}

function later(callback: () => void, ms: number): void {
  timers.push(window.setTimeout(callback, ms));
}

/**
 * Opens the link in a new tab with no opener and no referrer. Browsers block
 * tabs opened too long after the click, and with `noopener` there is no handle
 * to check, so a page that keeps focus afterwards counts as blocked.
 */
function openLink(link: SocialLink, onBlocked: () => void): void {
  window.open(link.url, "_blank", "noopener,noreferrer");
  window.setTimeout((): void => {
    if (document.visibilityState === "visible" && document.hasFocus()) onBlocked();
  }, BLOCKED_CHECK_MS);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useContactSignal = create<ContactSignalStore>()((set, get) => {
  const deliver = (): void => {
    const { link } = get();
    clearTimers();
    if (!link) return;
    openLink(link, (): void => set({ blocked: link }));
    set((state) => ({ phase: "returning", plays: state.plays + 1 }));
    later((): void => set({ phase: "idle", link: null }), RETURN_SECONDS * 1000);
  };

  return {
    phase: "idle",
    link: null,
    startedAt: 0,
    plays: 0,
    blocked: null,
    transmit: (link: SocialLink): void => {
      if (get().phase !== "idle") return;
      clearTimers();
      set({ phase: "connecting", link, startedAt: performance.now(), blocked: null });
      if (prefersReducedMotion()) {
        deliver();
        return;
      }
      later((): void => set({ phase: "flight" }), CONNECT_SECONDS * 1000);
      later(deliver, (CONNECT_SECONDS + FLIGHT_SECONDS) * 1000);
    },
    skip: (): void => {
      const { phase } = get();
      if (phase === "connecting" || phase === "flight") deliver();
    },
  };
});

/** Seconds since the flight started, or a negative number before it. */
export function flightElapsed(): number {
  const { phase, startedAt } = useContactSignal.getState();
  if (phase !== "flight") return -1;
  return (performance.now() - startedAt) / 1000 - CONNECT_SECONDS;
}

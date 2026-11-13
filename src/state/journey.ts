/**
 * Per-frame journey values shared between the WebGL loop and the DOM overlay.
 *
 * These change every frame, so they live in a mutable object instead of React
 * state; overlays subscribe with `useJourneyFrame` and write styles directly.
 */
import { Vector3 } from "three";

import { KEYFRAMES } from "@/data/journey";

export interface JourneyState {
  /** Raw scroll progress in [0, 1]. */
  target: number;
  /** Smoothed progress in [0, 1]. */
  current: number;
  /** Smoothed position along the keyframes, in [0, KEYFRAMES.length - 1]. */
  stop: number;
  /** Camera distance travelled, in world units. */
  distance: number;
  /** How far the camera has blended into a focus view, in [0, 1]. */
  focusBlend: number;
  pointerX: number;
  pointerY: number;
  elapsed: number;
  /** How much the camera backs off on narrow screens (1 on landscape). */
  pullBack: number;
  /** Camera position without the narrow-screen pull-back, for distance fades. */
  readonly viewer: Vector3;
}

export const journey: JourneyState = {
  target: 0,
  current: 0,
  stop: 0,
  distance: 0,
  focusBlend: 0,
  pointerX: 0,
  pointerY: 0,
  elapsed: 0,
  pullBack: 1,
  viewer: new Vector3(0, 0, 30),
};

export const LAST_STOP: number = KEYFRAMES.length - 1;

type JourneyListener = (state: JourneyState) => void;

const listeners: Set<JourneyListener> = new Set();

export function subscribeJourney(listener: JourneyListener): () => void {
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}

export function emitJourney(): void {
  listeners.forEach((listener: JourneyListener): void => listener(journey));
}

/** Smooth-scrolls the page to a keyframe index. */
export function scrollToStop(stop: number): void {
  const max: number = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: (stop / LAST_STOP) * max, behavior: "smooth" });
}

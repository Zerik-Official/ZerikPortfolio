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
  /** How far the contact flight has taken over the camera, in [0, 1]. */
  cinematicBlend: number;
  pointerX: number;
  pointerY: number;
  elapsed: number;
  /** How much the camera backs off on narrow screens (1 on landscape). */
  pullBack: number;
  /** Camera position without the narrow-screen pull-back, for distance fades. */
  readonly viewer: Vector3;
  /** Requested free-look offset, in world units (see `ExploreToggle`). */
  panTargetX: number;
  panTargetY: number;
  /** Smoothed free-look offset applied to the camera. */
  panX: number;
  panY: number;
}

export const journey: JourneyState = {
  target: 0,
  current: 0,
  stop: 0,
  distance: 0,
  focusBlend: 0,
  cinematicBlend: 0,
  pointerX: 0,
  pointerY: 0,
  elapsed: 0,
  pullBack: 1,
  viewer: new Vector3(0, 0, 30),
  panTargetX: 0,
  panTargetY: 0,
  panX: 0,
  panY: 0,
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

let viewportHeight: number = 0;
let viewportWidth: number = 0;

/**
 * Height of the large viewport (address bar hidden). Mobile browsers change
 * `innerHeight` while their address bar slides, which would nudge the scroll
 * progress and make the camera bob; this only changes with the width.
 */
function stableViewportHeight(): number {
  if (viewportHeight > 0 && viewportWidth === window.innerWidth) return viewportHeight;
  const probe: HTMLDivElement = document.createElement("div");
  probe.style.cssText = "position:absolute;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  viewportHeight = Math.max(probe.offsetHeight, window.innerHeight);
  viewportWidth = window.innerWidth;
  probe.remove();
  return viewportHeight;
}

/** Scrollable distance of the journey, in pixels. */
export function scrollRange(): number {
  return Math.max(document.documentElement.scrollHeight - stableViewportHeight(), 1);
}

/** Smooth-scrolls the page to a keyframe index. */
export function scrollToStop(stop: number, behavior: ScrollBehavior = "smooth"): void {
  window.scrollTo({ top: (stop / LAST_STOP) * scrollRange(), behavior });
}

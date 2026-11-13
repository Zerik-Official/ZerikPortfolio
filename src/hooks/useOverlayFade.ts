import { type RefObject, useLayoutEffect, useRef } from "react";

import { useJourneyFrame } from "@/hooks/useJourneyFrame";
import { journey, type JourneyState } from "@/state/journey";

function applyOpacity(node: HTMLElement, opacity: number): void {
  node.style.opacity = opacity.toFixed(3);
  node.style.visibility = opacity < 0.01 ? "hidden" : "visible";
  node.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
}

/**
 * Drives an overlay's opacity from the journey every frame without React
 * re-renders. Pointer events are enabled only while it is mostly visible.
 */
export function useOverlayFade<T extends HTMLElement>(opacityOf: (state: JourneyState) => number): RefObject<T | null> {
  const ref = useRef<T>(null);
  useLayoutEffect((): void => {
    if (ref.current) applyOpacity(ref.current, opacityOf(journey));
  }, []);
  useJourneyFrame((state: JourneyState): void => {
    if (ref.current) applyOpacity(ref.current, opacityOf(state));
  });
  return ref;
}

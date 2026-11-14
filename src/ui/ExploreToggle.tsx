import { type JSX, useEffect } from "react";

import { firstKeyframeOf } from "@/data/journey";
import { useOverlayFade } from "@/hooks/useOverlayFade";
import { useI18n } from "@/i18n/useI18n";
import { clamp, windowRamp } from "@/lib/math";
import { journey, type JourneyState } from "@/state/journey";
import { useUniverse } from "@/state/store";

const TOOLS_STOP: number = firstKeyframeOf("tools");

/** Free-look limits around the constellation's centre, in world units. */
const PAN_LIMIT_X: readonly [number, number] = [-46, 58];
const PAN_LIMIT_Y: readonly [number, number] = [-36, 26];

/** World units covered by one screen pixel at the constellation's depth. */
function worldPerPixel(): number {
  const viewHeight: number = 2 * 92 * journey.pullBack * Math.tan((55 * Math.PI) / 360);
  return viewHeight / window.innerHeight;
}

/** Dragging anywhere on the scene pans the camera while exploring. */
function useDragPan(enabled: boolean): void {
  useEffect((): (() => void) | undefined => {
    if (!enabled) return undefined;
    let last: { x: number; y: number } | null = null;
    const onDown = (event: PointerEvent): void => {
      if (!(event.target instanceof Element) || !event.target.closest(".universe-canvas")) return;
      last = { x: event.clientX, y: event.clientY };
    };
    const onMove = (event: PointerEvent): void => {
      if (!last) return;
      const scale: number = worldPerPixel();
      journey.panTargetX = clamp(journey.panTargetX - (event.clientX - last.x) * scale, ...PAN_LIMIT_X);
      journey.panTargetY = clamp(journey.panTargetY + (event.clientY - last.y) * scale, ...PAN_LIMIT_Y);
      last = { x: event.clientX, y: event.clientY };
    };
    const onUp = (): void => {
      last = null;
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return (): void => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [enabled]);
}

/**
 * Constellation free look: the tools spread wider than a phone screen, so a
 * toggle lets the visitor drag across them in both directions.
 */
export function ExploreToggle(): JSX.Element {
  const { m } = useI18n();
  const exploring: boolean = useUniverse((state) => state.exploring);
  const setExploring = useUniverse((state) => state.setExploring);
  useDragPan(exploring);
  const ref = useOverlayFade<HTMLDivElement>(
    (state: JourneyState): number =>
      windowRamp(state.stop, TOOLS_STOP - 0.4, TOOLS_STOP - 0.15, TOOLS_STOP + 0.15, TOOLS_STOP + 0.4) * (1 - clamp(state.focusBlend * 3)),
  );

  return (
    <div ref={ref} className="overlay inset-x-0 top-[calc(11vh+6.6rem)] z-10 flex flex-col items-center gap-2 px-5 md:top-[calc(11vh+8rem)]">
      <button type="button" className="pill" aria-pressed={exploring} onClick={(): void => setExploring(!exploring)}>
        <span aria-hidden="true">{exploring ? "✓" : "✥"}</span>
        {exploring ? m.hud.exploreDone : m.hud.explore}
      </button>
      {exploring && <p className="serif legible m-0 text-center text-[0.98rem] text-ink/80">{m.hud.exploreHint}</p>}
    </div>
  );
}

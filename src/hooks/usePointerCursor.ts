import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";

import { useUniverse } from "@/state/store";

interface PointerHandlers {
  readonly onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  readonly onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
}

/**
 * Pointer handlers that toggle the hand cursor and report hover state.
 *
 * Touch input never hovers: a tap would otherwise leave the body "hovered"
 * (and its card expanded) until the next tap somewhere else.
 */
export function usePointerCursor(onHoverChange?: (hovered: boolean) => void, enabled?: () => boolean): PointerHandlers {
  return useMemo(
    (): PointerHandlers => ({
      onPointerOver: (event: ThreeEvent<PointerEvent>): void => {
        if (event.pointerType === "touch" || (enabled && !enabled())) return;
        event.stopPropagation();
        useUniverse.getState().setHovering(true);
        onHoverChange?.(true);
      },
      onPointerOut: (): void => {
        useUniverse.getState().setHovering(false);
        onHoverChange?.(false);
      },
    }),
    [onHoverChange, enabled],
  );
}

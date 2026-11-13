import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";

import { useUniverse } from "@/state/store";

interface PointerHandlers {
  readonly onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  readonly onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
}

/** Pointer handlers that toggle the hand cursor and report hover state. */
export function usePointerCursor(onHoverChange?: (hovered: boolean) => void): PointerHandlers {
  return useMemo(
    (): PointerHandlers => ({
      onPointerOver: (event: ThreeEvent<PointerEvent>): void => {
        event.stopPropagation();
        useUniverse.getState().setHovering(true);
        onHoverChange?.(true);
      },
      onPointerOut: (): void => {
        useUniverse.getState().setHovering(false);
        onHoverChange?.(false);
      },
    }),
    [onHoverChange],
  );
}

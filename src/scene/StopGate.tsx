import { useFrame } from "@react-three/fiber";
import { createContext, type JSX, type ReactNode, type RefObject, useContext, useRef } from "react";
import type { Group } from "three";

import { journey } from "@/state/journey";

interface StopGateProps {
  /** First keyframe position (fractional) where the children render. */
  readonly from: number;
  /** Last keyframe position (fractional) where the children render. */
  readonly to: number;
  readonly children: ReactNode;
}

const ALWAYS_ACTIVE: RefObject<boolean> = { current: true };
const GateContext = createContext<RefObject<boolean>>(ALWAYS_ACTIVE);

/**
 * Whether the enclosing gate is currently rendering. Animated children read it
 * in `useFrame` to skip work while their chapter is off screen.
 */
export function useGateActive(): RefObject<boolean> {
  return useContext(GateContext);
}

/**
 * Renders and animates a body only around the journey stops where it belongs,
 * so each chapter reveals itself on arrival regardless of screen shape.
 */
export function StopGate({ from, to, children }: StopGateProps): JSX.Element {
  const group = useRef<Group>(null);
  const active = useRef<boolean>(false);
  useFrame((): void => {
    active.current = journey.stop >= from && journey.stop <= to;
    if (group.current) group.current.visible = active.current;
  }, -1);
  return (
    <GateContext.Provider value={active}>
      <group ref={group} visible={false}>
        {children}
      </group>
    </GateContext.Provider>
  );
}

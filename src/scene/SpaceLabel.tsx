import { type JSX, type ReactNode, useEffect, useId, useLayoutEffect, useRef } from "react";
import type { Group } from "three";

import type { Vec3 } from "@/data/journey";
import { type LabelPlacement, labelPlacements, useLabelContents } from "@/state/labels";

interface SpaceLabelProps {
  readonly position: Vec3;
  readonly children: ReactNode;
  /** Fully visible while the camera is closer than roughly this distance. */
  readonly far: number;
  /** Hidden while the camera is closer than this. */
  readonly near?: number;
  readonly visible?: boolean;
  /** Screen-space offset below the anchor, in pixels. */
  readonly offsetY?: number;
  /** Fade out instead of overlapping other colliding labels. */
  readonly collide?: boolean;
  /** Higher priority wins collisions and is drawn on top. */
  readonly priority?: number;
}

/**
 * DOM label pinned to a 3D point. It only registers its anchor and content;
 * `LabelLayer` renders it and `LabelProjector` positions it every frame.
 */
export function SpaceLabel({
  position,
  children,
  far,
  near = 0,
  visible = true,
  offsetY = 0,
  collide = false,
  priority = 0,
}: SpaceLabelProps): JSX.Element {
  const id: string = useId();
  const anchor = useRef<Group>(null);
  const setContent = useLabelContents((state) => state.setContent);
  const removeContent = useLabelContents((state) => state.removeContent);

  useLayoutEffect((): void => {
    const placement: LabelPlacement = labelPlacements.get(id) ?? { anchor: null, far, near, visible, offsetY, collide, priority, fade: 1 };
    placement.anchor = anchor.current;
    placement.far = far;
    placement.near = near;
    placement.visible = visible;
    placement.offsetY = offsetY;
    placement.collide = collide;
    placement.priority = priority;
    labelPlacements.set(id, placement);
  });

  useEffect((): void => {
    setContent(id, children);
  }, [id, children, setContent]);

  useEffect(
    (): (() => void) => (): void => {
      labelPlacements.delete(id);
      removeContent(id);
    },
    [id, removeContent],
  );

  return <group ref={anchor} position={position as [number, number, number]} />;
}

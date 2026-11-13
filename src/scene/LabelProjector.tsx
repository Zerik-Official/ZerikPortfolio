import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { type Object3D, Vector3 } from "three";

import { clamp, dampFactor } from "@/lib/math";
import { journey } from "@/state/journey";
import { type LabelPlacement, labelElements, labelPlacements } from "@/state/labels";

const COLLISION_PADDING: number = 6;
const SIZE_REFRESH_FRAMES: number = 20;

interface Candidate {
  readonly id: string;
  readonly placement: LabelPlacement;
  readonly element: HTMLDivElement;
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly opacity: number;
}

interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface CachedSize {
  width: number;
  height: number;
  age: number;
}

function isRendered(object: Object3D): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function hide(element: HTMLDivElement): void {
  if (element.style.visibility === "hidden") return;
  element.style.opacity = "0";
  element.style.visibility = "hidden";
  element.style.pointerEvents = "none";
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function byPriorityThenDepth(a: Candidate, b: Candidate): number {
  return b.placement.priority - a.placement.priority || a.depth - b.depth;
}

/**
 * Projects every registered label onto the screen once per frame. Labels that
 * opt into collision are placed by priority, then nearest first; any that
 * would overlap one already placed fades out until it is clear again.
 */
export function LabelProjector(): null {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const world: Vector3 = useMemo((): Vector3 => new Vector3(), []);
  const projected: Vector3 = useMemo((): Vector3 => new Vector3(), []);
  const sizes: Map<string, CachedSize> = useMemo((): Map<string, CachedSize> => new Map(), []);

  const measure = (id: string, element: HTMLDivElement): CachedSize => {
    const cached: CachedSize | undefined = sizes.get(id);
    if (cached && cached.age < SIZE_REFRESH_FRAMES && cached.width > 0) {
      cached.age += 1;
      return cached;
    }
    const fresh: CachedSize = { width: element.offsetWidth, height: element.offsetHeight, age: 0 };
    sizes.set(id, fresh);
    return fresh;
  };

  const show = (candidate: Candidate, opacity: number): void => {
    const { element, x, y, placement } = candidate;
    if (opacity < 0.02) {
      hide(element);
      return;
    }
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    element.style.opacity = opacity.toFixed(3);
    element.style.visibility = "visible";
    element.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
    element.style.zIndex = String(placement.priority > 0 ? 2 : placement.collide ? 1 : 0);
  };

  useFrame((_, delta: number): void => {
    const colliding: Candidate[] = [];
    labelPlacements.forEach((placement: LabelPlacement, id: string): void => {
      const element: HTMLDivElement | undefined = labelElements.get(id);
      if (!element) return;
      const anchor: Object3D | null = placement.anchor;
      if (!anchor || !placement.visible || !isRendered(anchor)) {
        placement.fade = 0;
        hide(element);
        return;
      }
      anchor.getWorldPosition(world);
      const distance: number = journey.viewer.distanceTo(world);
      const fadeOut: number = clamp((placement.far - distance) / (placement.far * 0.3));
      const fadeIn: number = placement.near > 0 ? clamp((distance - placement.near) / (placement.near * 0.5)) : 1;
      const opacity: number = fadeOut * fadeIn;
      projected.copy(world).project(camera);
      if (opacity < 0.02 || projected.z > 1 || projected.z < -1) {
        placement.fade = 0;
        hide(element);
        return;
      }
      const candidate: Candidate = {
        id,
        placement,
        element,
        x: (projected.x * 0.5 + 0.5) * size.width,
        y: (-projected.y * 0.5 + 0.5) * size.height + placement.offsetY,
        depth: projected.z,
        opacity,
      };
      if (placement.collide) colliding.push(candidate);
      else show(candidate, opacity);
    });

    colliding.sort(byPriorityThenDepth);
    const placed: Rect[] = [];
    const step: number = dampFactor(10, delta);
    colliding.forEach((candidate: Candidate): void => {
      const { width, height } = measure(candidate.id, candidate.element);
      const rect: Rect = {
        left: candidate.x - width / 2 - COLLISION_PADDING,
        top: candidate.y - height / 2 - COLLISION_PADDING,
        right: candidate.x + width / 2 + COLLISION_PADDING,
        bottom: candidate.y + height / 2 + COLLISION_PADDING,
      };
      const blocked: boolean = placed.some((other: Rect): boolean => overlaps(rect, other));
      if (!blocked) placed.push(rect);
      const placement: LabelPlacement = candidate.placement;
      placement.fade += ((blocked ? 0 : 1) - placement.fade) * step;
      show(candidate, candidate.opacity * placement.fade);
    });
  });

  return null;
}

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";

import { KEYFRAMES, type Keyframe, type Vec3 } from "@/data/journey";
import { type CameraPose, blackHolePose, galaxyPose, getGalaxy, getSystem, systemPose } from "@/lib/layout";
import { clamp, dampFactor, smootherstep } from "@/lib/math";
import { emitJourney, journey, LAST_STOP } from "@/state/journey";
import { type Focus, useUniverse } from "@/state/store";

function poseForFocus(focus: Focus): CameraPose | null {
  switch (focus.kind) {
    case "galaxy": {
      const galaxy = getGalaxy(focus.id);
      return galaxy ? galaxyPose(galaxy) : null;
    }
    case "system": {
      const system = getSystem(focus.id);
      return system ? systemPose(system) : null;
    }
    case "blackhole":
      return blackHolePose(focus.techId);
    default:
      return null;
  }
}

function lerpTuple(target: Vector3, from: Vec3, to: Vec3, t: number): Vector3 {
  return target.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t);
}

/** Camera driven by scroll between keyframes, or by the focused body. */
export function CameraRig(): null {
  const camera = useThree((state) => state.camera);
  const focus: Focus = useUniverse((state) => state.focus);
  const focusPose: CameraPose | null = useMemo((): CameraPose | null => poseForFocus(focus), [focus]);
  const look = useRef<Vector3>(new Vector3(0, 0, -100));
  const desiredPosition = useMemo((): Vector3 => new Vector3(), []);
  const desiredLook = useMemo((): Vector3 => new Vector3(), []);
  const scratch = useMemo((): Vector3 => new Vector3(), []);

  useEffect((): (() => void) => {
    const onScroll = (): void => {
      const max: number = document.documentElement.scrollHeight - window.innerHeight;
      journey.target = max > 0 ? clamp(window.scrollY / max) : 0;
    };
    const onPointer = (event: PointerEvent): void => {
      journey.pointerX = event.clientX / window.innerWidth - 0.5;
      journey.pointerY = event.clientY / window.innerHeight - 0.5;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return (): void => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  useEffect((): void => {
    document.documentElement.classList.toggle("scroll-locked", focus.kind !== "none");
  }, [focus]);

  useFrame((state, rawDelta: number): void => {
    const delta: number = Math.min(rawDelta, 0.25);
    journey.elapsed = state.clock.elapsedTime;
    journey.current += (journey.target - journey.current) * dampFactor(3.4, delta);

    const position: number = journey.current * LAST_STOP;
    const index: number = Math.min(Math.floor(position), LAST_STOP - 1);
    const eased: number = smootherstep((position - index - 0.1) / 0.8);
    const from: Keyframe = KEYFRAMES[index] as Keyframe;
    const to: Keyframe = KEYFRAMES[index + 1] as Keyframe;
    journey.stop = position;

    const focused: boolean = focusPose !== null;
    journey.focusBlend += ((focused ? 1 : 0) - journey.focusBlend) * dampFactor(2.2, delta);

    if (focusPose) {
      desiredPosition.set(...focusPose.position);
      desiredLook.set(...focusPose.lookAt);
    } else {
      lerpTuple(desiredPosition, from.position, to.position, eased);
      lerpTuple(desiredLook, from.lookAt, to.lookAt, eased);
    }
    const pullBack: number = clamp(1.25 / (state.size.width / state.size.height), 1, 2.1);
    journey.pullBack = pullBack;
    desiredPosition.sub(desiredLook).multiplyScalar(pullBack).add(desiredLook);
    const parallax: number = focused ? 1.2 : 3.2;
    desiredPosition.x += journey.pointerX * parallax;
    desiredPosition.y -= journey.pointerY * parallax * 0.6;

    const follow: number = dampFactor(focused || journey.focusBlend > 0.02 ? 2.4 : 9, delta);
    camera.position.lerp(desiredPosition, follow);
    look.current.lerp(desiredLook, follow);
    camera.lookAt(look.current);
    journey.viewer.copy(camera.position).sub(look.current).divideScalar(journey.pullBack).add(look.current);

    journey.distance = scratch.set(0, 0, 30).distanceTo(camera.position);
    const chapter = (KEYFRAMES[Math.round(position)] as Keyframe).chapter;
    useUniverse.getState().setChapter(chapter);
    emitJourney();
  });

  return null;
}

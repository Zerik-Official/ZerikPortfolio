import { useFrame, useThree } from "@react-three/fiber";
import { CO as COLOMBIA_FLAG } from "country-flag-icons/string/3x2";
import { type JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BackSide,
  Color,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  Quaternion,
  ShaderMaterial,
  type Sprite,
  type SpriteMaterial,
  type Texture,
  Vector3,
  Vector4,
} from "three";

import { BOGOTA, type EarthMaps, loadEarthMaps, lonLatToVector, REGION_BOUNDS } from "@/lib/earthMap";
import { clamp, dampFactor, smootherstep } from "@/lib/math";
import { getGlowTexture, loadFlagBadgeTexture } from "@/lib/textures";
import { ATMOSPHERE_FRAGMENT, ATMOSPHERE_VERTEX, EARTH_FRAGMENT, EARTH_VERTEX } from "@/scene/shaders";
import { useGateActive } from "@/scene/StopGate";
import { BEAM_STARTS, cinematic, DIVE_STARTS, FLIGHT_SECONDS, flightElapsed, useContactSignal } from "@/state/contactSignal";

export const EARTH_POSITION: readonly [number, number, number] = [0, -142, -1470];
const EARTH_RADIUS: number = 96;
const SIGNAL_REACH: number = 0.22;

const UP: Vector3 = new Vector3(0, 1, 0);
/** Bogotá on the unit sphere, in the planet's own (unrotated) space. */
const ORIGIN: Vector3 = lonLatToVector(BOGOTA.lon, BOGOTA.lat);
const NORTH: Vector3 = UP.clone().sub(ORIGIN.clone().multiplyScalar(ORIGIN.y)).normalize();
const EAST: Vector3 = new Vector3().crossVectors(NORTH, ORIGIN).normalize();
const LANDING: Vector3 = ORIGIN.clone().multiplyScalar(EARTH_RADIUS);
const SATELLITE: Vector3 = ORIGIN.clone().addScaledVector(EAST, 0.34).addScaledVector(NORTH, 0.24).normalize().multiplyScalar(EARTH_RADIUS * 1.42);
const FLAG: Vector3 = lonLatToVector(-72, 1.8).multiplyScalar(EARTH_RADIUS * 1.075);
const BEAM_LENGTH: number = SATELLITE.distanceTo(LANDING);
const BEAM_ROTATION: Quaternion = new Quaternion().setFromUnitVectors(UP, LANDING.clone().sub(SATELLITE).normalize());
const SATELLITE_ROTATION: Quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, -1, 0), SATELLITE.clone().normalize().negate());

function azimuth(vector: Vector3): number {
  return Math.atan2(vector.x, vector.z);
}

/** Nearest angle to `from` that is equivalent to `to`. */
function nearestAngle(from: number, to: number): number {
  const turn: number = Math.PI * 2;
  return from + ((((to - from) % turn) + turn * 1.5) % turn) - turn / 2;
}

function runWhenIdle(callback: () => void): void {
  const idle = (window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(callback, { timeout: 2500 });
  else window.setTimeout(callback, 1200);
}

function Satellite(): JSX.Element {
  const light = useRef<SpriteMaterial>(null);
  const gate = useGateActive();
  useFrame(({ clock }): void => {
    if (!gate.current || !light.current) return;
    light.current.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(clock.elapsedTime * 4));
  });
  return (
    <group position={SATELLITE} quaternion={SATELLITE_ROTATION} scale={2.2}>
      <mesh>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#d9b77a" metalness={0.6} roughness={0.35} emissive="#3a2a12" />
      </mesh>
      {[-1, 1].map((side: number): JSX.Element => (
        <group key={side} position={[side * 3.2, 0.2, 0]}>
          <mesh>
            <boxGeometry args={[4.2, 0.08, 1.5]} />
            <meshStandardMaterial color="#1f3b73" metalness={0.3} roughness={0.4} emissive="#2a5cff" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[-side * 1.15, 0, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.1]} />
            <meshStandardMaterial color="#9a8f7c" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -1.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.1, 0.8, 24, 1, true]} />
        <meshStandardMaterial color="#f3ede2" metalness={0.2} roughness={0.5} side={BackSide} />
      </mesh>
      <sprite position={[0, 1.5, 0]} scale={[2.4, 2.4, 1]}>
        <spriteMaterial ref={light} map={getGlowTexture()} color="#ff9a4a" transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  );
}

/** Colombia's flag floating over the country, like the technology badges. */
function FlagBadge(): JSX.Element | null {
  const gl = useThree((state) => state.gl);
  const sprite = useRef<Sprite>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect((): (() => void) => {
    let active: boolean = true;
    void loadFlagBadgeTexture(COLOMBIA_FLAG).then((loaded: Texture): void => {
      if (!active) return;
      gl.initTexture(loaded);
      setTexture(loaded);
    });
    return (): void => {
      active = false;
    };
  }, [gl]);
  const gate = useGateActive();
  const normal: Vector3 = useMemo((): Vector3 => FLAG.clone().normalize(), []);
  useFrame(({ clock }): void => {
    if (!gate.current || !sprite.current) return;
    sprite.current.position.copy(FLAG).addScaledVector(normal, Math.sin(clock.elapsedTime * 1.1) * 0.8);
  });
  if (!texture) return null;
  return (
    <sprite ref={sprite} position={FLAG} scale={[6.2, 6.2, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

/** Home planet at the end of the journey, where the contact signal lands. */
export function Earth(): JSX.Element {
  const gl = useThree((state) => state.gl);
  const planet = useRef<Group>(null);
  const beam = useRef<Group>(null);
  const beamCore = useRef<Mesh>(null);
  const beamHead = useRef<Sprite>(null);
  const beamMaterial = useRef<MeshBasicMaterial>(null);
  const headMaterial = useRef<SpriteMaterial>(null);
  const alignTo = useRef<number | null>(null);

  const surface: ShaderMaterial = useMemo(
    (): ShaderMaterial =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uWorld: { value: null },
          uRegion: { value: null },
          uHasMap: { value: 0 },
          uRegionBounds: { value: new Vector4(...REGION_BOUNDS) },
          uOrigin: { value: ORIGIN.clone() },
          uSignal: { value: 0 },
          uSignalGlow: { value: 0 },
        },
        vertexShader: EARTH_VERTEX,
        fragmentShader: EARTH_FRAGMENT,
      }),
    [],
  );
  const atmosphere: ShaderMaterial = useMemo(
    (): ShaderMaterial =>
      new ShaderMaterial({
        uniforms: { uColor: { value: new Color("#4f9dff") }, uPower: { value: 2.6 }, uOpacity: { value: 0.85 } },
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        side: BackSide,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect((): void => {
    runWhenIdle((): void => {
      void loadEarthMaps().then((maps: EarthMaps): void => {
        gl.initTexture(maps.world);
        gl.initTexture(maps.region);
        const uniforms = surface.uniforms as Record<string, { value: unknown }>;
        (uniforms.uWorld as { value: unknown }).value = maps.world;
        (uniforms.uRegion as { value: unknown }).value = maps.region;
        (uniforms.uHasMap as { value: unknown }).value = 1;
      });
    });
  }, [gl, surface]);

  const center: Vector3 = useMemo((): Vector3 => new Vector3(...EARTH_POSITION), []);
  const scratch = useMemo(
    () => ({ normal: new Vector3(), landing: new Vector3(), satellite: new Vector3(), up: new Vector3(), side: new Vector3(), toCamera: new Vector3() }),
    [],
  );

  const gate = useGateActive();
  useFrame(({ clock, camera }, delta: number): void => {
    if (!gate.current || !planet.current) return;
    const uniforms = surface.uniforms as Record<string, { value: number }>;
    (uniforms.uTime as { value: number }).value = clock.elapsedTime;
    const phase = useContactSignal.getState().phase;
    const elapsed: number = flightElapsed();
    const flying: boolean = elapsed >= 0;

    // Spin slowly; during the flight turn Colombia towards the camera instead.
    if (flying) {
      if (alignTo.current === null) {
        const facing: number = azimuth(scratch.toCamera.copy(camera.position).sub(center));
        alignTo.current = nearestAngle(planet.current.rotation.y, facing - azimuth(ORIGIN));
      }
      planet.current.rotation.y += (alignTo.current - planet.current.rotation.y) * dampFactor(2.6, delta);
    } else {
      alignTo.current = null;
      if (phase === "idle") planet.current.rotation.y += delta * 0.01;
    }

    // Beam from the satellite, then the signal spreading across Colombia.
    const beamProgress: number = flying ? smootherstep((elapsed - BEAM_STARTS) / (DIVE_STARTS - BEAM_STARTS)) : 0;
    const spread: number = flying ? clamp((elapsed - DIVE_STARTS) / (FLIGHT_SECONDS - DIVE_STARTS)) : 1;
    const signal = uniforms.uSignal as { value: number };
    const glow = uniforms.uSignalGlow as { value: number };
    if (flying) {
      signal.value = (1 - Math.pow(1 - spread, 3)) * SIGNAL_REACH;
      glow.value = elapsed >= DIVE_STARTS ? 1 : 0;
    } else {
      glow.value *= 1 - dampFactor(0.45, delta);
    }
    const beamOpacity: number = flying ? clamp(beamProgress * 3) * (1 - spread * 0.6) : 0;
    if (beam.current) beam.current.visible = beamOpacity > 0.01;
    if (beamCore.current && beamMaterial.current && beamHead.current && headMaterial.current) {
      const length: number = Math.max(BEAM_LENGTH * beamProgress, 0.001);
      beamCore.current.scale.set(1, length, 1);
      beamCore.current.position.set(0, length / 2, 0);
      beamMaterial.current.opacity = beamOpacity * (0.75 + 0.25 * Math.sin(clock.elapsedTime * 30));
      beamHead.current.position.set(0, length, 0);
      headMaterial.current.opacity = beamOpacity;
    }

    // Camera beats: reach orbit beside the satellite, watch the beam, dive to Colombia.
    cinematic.active = flying;
    if (!flying) return;
    planet.current.updateMatrixWorld();
    const { normal, landing, satellite, up, side } = scratch;
    planet.current.localToWorld(landing.copy(LANDING));
    planet.current.localToWorld(satellite.copy(SATELLITE));
    normal.copy(landing).sub(center).normalize();
    up.copy(UP).addScaledVector(normal, -normal.dot(UP)).normalize();
    side.crossVectors(normal, up);
    if (elapsed < BEAM_STARTS) {
      cinematic.position.copy(normal).addScaledVector(side, 0.5).addScaledVector(up, 0.4).normalize().multiplyScalar(EARTH_RADIUS * 2.05).add(center);
      cinematic.lookAt.copy(satellite).lerp(landing, 0.3);
    } else if (elapsed < DIVE_STARTS) {
      cinematic.position.copy(normal).addScaledVector(side, 0.38).addScaledVector(up, 0.3).normalize().multiplyScalar(EARTH_RADIUS * 1.85).add(center);
      cinematic.lookAt.copy(satellite).lerp(landing, 0.6);
    } else {
      cinematic.position.copy(landing).addScaledVector(normal, EARTH_RADIUS * 0.6).addScaledVector(up, -EARTH_RADIUS * 0.08);
      cinematic.lookAt.copy(landing);
    }
  });

  return (
    <group position={EARTH_POSITION as [number, number, number]}>
      <group ref={planet} rotation={[0, -0.12, 0]}>
        <mesh material={surface}>
          <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        </mesh>
        <Satellite />
        <FlagBadge />
        <group ref={beam} position={SATELLITE} quaternion={BEAM_ROTATION} visible={false}>
          <mesh ref={beamCore}>
            <cylinderGeometry args={[0.32, 0.32, 1, 10, 1, true]} />
            <meshBasicMaterial ref={beamMaterial} color="#ffd9a0" transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          <sprite ref={beamHead} scale={[7, 7, 1]}>
            <spriteMaterial ref={headMaterial} map={getGlowTexture()} color="#ffcf8a" transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      </group>
      <mesh material={atmosphere} scale={1.07}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      </mesh>
    </group>
  );
}

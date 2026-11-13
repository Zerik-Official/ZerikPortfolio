import { useFrame } from "@react-three/fiber";
import { type JSX, useMemo, useRef } from "react";
import { AdditiveBlending, BackSide, Color, type Mesh, ShaderMaterial } from "three";

import { ATMOSPHERE_FRAGMENT, ATMOSPHERE_VERTEX, PLANET_FRAGMENT, PLANET_VERTEX } from "@/scene/shaders";
import { useGateActive } from "@/scene/StopGate";

export const EARTH_POSITION: readonly [number, number, number] = [0, -142, -1470];
const EARTH_RADIUS: number = 96;

/** Home planet waiting at the end of the journey. */
export function Earth(): JSX.Element {
  const planet = useRef<Mesh>(null);
  const surface: ShaderMaterial = useMemo(
    (): ShaderMaterial => new ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: PLANET_VERTEX, fragmentShader: PLANET_FRAGMENT }),
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

  const gate = useGateActive();
  useFrame(({ clock }, delta: number): void => {
    if (!gate.current) return;
    (surface.uniforms.uTime as { value: number }).value = clock.elapsedTime;
    if (planet.current) planet.current.rotation.y += delta * 0.01;
  });

  return (
    <group position={EARTH_POSITION as [number, number, number]}>
      <mesh ref={planet} material={surface}>
        <sphereGeometry args={[EARTH_RADIUS, 72, 72]} />
      </mesh>
      <mesh material={atmosphere} scale={1.07}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      </mesh>
    </group>
  );
}

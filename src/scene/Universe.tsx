import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { type JSX, useState } from "react";

import type { BlackHole, Galaxy, Nebula } from "@/data/types";
import { BLACK_HOLES, GALAXIES, NEBULAE } from "@/data/universe";
import { AsteroidBelt } from "@/scene/AsteroidBelt";
import { BlackHoleView } from "@/scene/BlackHole";
import { CameraRig } from "@/scene/CameraRig";
import { LabelProjector } from "@/scene/LabelProjector";
import { StopGate } from "@/scene/StopGate";
import { Earth } from "@/scene/Earth";
import { GalaxyView } from "@/scene/Galaxy";
import { NebulaView } from "@/scene/Nebula";
import { Starfield } from "@/scene/Starfield";
import { ToolConstellation } from "@/scene/ToolConstellation";
import { useUniverse } from "@/state/store";

const IS_COMPACT: boolean = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

export function Universe(): JSX.Element {
  const [density] = useState<number>(IS_COMPACT ? 0.55 : 1);
  const [bloom, setBloom] = useState<boolean>(true);
  const hovering: boolean = useUniverse((state) => state.hovering);

  return (
    <Canvas
      className="universe-canvas"
      style={{ cursor: hovering ? "pointer" : "default" }}
      dpr={[1, IS_COMPACT ? 1.5 : 2]}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 55, near: 0.1, far: 4000, position: [0, 0, 30] }}
      aria-hidden="true"
    >
      <color attach="background" args={["#000000"]} />
      <PerformanceMonitor onDecline={(): void => setBloom(false)} onIncline={(): void => setBloom(true)} />
      <AdaptiveDpr pixelated={false} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[40, 60, 30]} intensity={1.4} color="#ffe6c7" />
      <CameraRig />
      <LabelProjector />
      <Starfield count={Math.round(7000 * density)} />
      <StopGate from={1.35} to={3.6}>
        <AsteroidBelt density={density} />
      </StopGate>
      {GALAXIES.map((galaxy: Galaxy): JSX.Element => (
        <GalaxyView key={galaxy.id} galaxy={galaxy} density={density} />
      ))}
      {NEBULAE.map((nebula: Nebula): JSX.Element => (
        <StopGate key={nebula.id} from={3.2} to={6.8}>
          <NebulaView nebula={nebula} />
        </StopGate>
      ))}
      <StopGate from={6.2} to={7.6}>
        {BLACK_HOLES.map((hole: BlackHole): JSX.Element => (
          <BlackHoleView key={hole.techId} hole={hole} />
        ))}
      </StopGate>
      <StopGate from={7.2} to={8.6}>
        <ToolConstellation />
      </StopGate>
      <StopGate from={8.35} to={9}>
        <Earth />
      </StopGate>
      {/* Compiles every shader and uploads every texture up front, so no chapter stalls the first time it appears. */}
      <Preload all />
      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.18} luminanceSmoothing={0.3} resolutionScale={0.5} />
          <Vignette offset={0.3} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

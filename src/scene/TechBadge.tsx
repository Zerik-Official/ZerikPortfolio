import type { ThreeEvent } from "@react-three/fiber";
import type { JSX } from "react";

import type { Vec3 } from "@/data/journey";
import type { TechId } from "@/data/types";
import { useBadgeTexture } from "@/hooks/useBadgeTexture";

interface TechBadgeProps {
  readonly techId: TechId;
  readonly size: number;
  readonly position?: Vec3;
  readonly opacity?: number;
  readonly onClick?: (event: ThreeEvent<MouseEvent>) => void;
  readonly onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  readonly onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
}

/** Camera-facing sprite showing a technology's real logo. */
export function TechBadge({ techId, size, position = [0, 0, 0], opacity = 1, onClick, onPointerOver, onPointerOut }: TechBadgeProps): JSX.Element | null {
  const texture = useBadgeTexture(techId);
  if (!texture) return null;
  return (
    <sprite
      position={position as [number, number, number]}
      scale={[size, size, 1]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <spriteMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

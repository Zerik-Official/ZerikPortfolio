import { Line } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { type JSX, useMemo, useRef, useState } from "react";
import type { Group } from "three";

import { getTech } from "@/data/techs";
import { TOOL_LINKS, TOOL_NODES } from "@/data/tools";
import type { TechId, ToolLink, ToolNode } from "@/data/types";
import { useI18n } from "@/i18n/useI18n";
import { usePointerCursor } from "@/hooks/usePointerCursor";
import { SpaceLabel } from "@/scene/SpaceLabel";
import { TechBadge } from "@/scene/TechBadge";
import { useUniverse } from "@/state/store";
import { useGateActive } from "@/scene/StopGate";

const NODE_BY_TECH: ReadonlyMap<TechId, ToolNode> = new Map(TOOL_NODES.map((node: ToolNode): [TechId, ToolNode] => [node.techId, node]));

function midpoint(link: ToolLink): [number, number, number] {
  const a = (NODE_BY_TECH.get(link.from) as ToolNode).position;
  const b = (NODE_BY_TECH.get(link.to) as ToolNode).position;
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

interface ToolStarProps {
  readonly node: ToolNode;
  readonly state: "idle" | "active" | "linked" | "dimmed";
  readonly onHover: (techId: TechId | null) => void;
  readonly index: number;
}

function ToolStar({ node, state, onHover, index }: ToolStarProps): JSX.Element {
  const float = useRef<Group>(null);
  const select = useUniverse((store) => store.select);
  const handleHover = useMemo(() => (hovered: boolean): void => onHover(hovered ? node.techId : null), [node.techId, onHover]);
  const pointer = usePointerCursor(handleHover);
  const size: number = state === "active" ? 6.4 : state === "linked" ? 5.4 : 4.6;

  const gate = useGateActive();
  useFrame(({ clock }): void => {
    if (!gate.current) return;
    if (float.current) float.current.position.y = Math.sin(clock.elapsedTime * 0.7 + index * 1.3) * 0.6;
  });

  const choose = (event?: ThreeEvent<MouseEvent>): void => {
    event?.stopPropagation();
    const current = useUniverse.getState().selection;
    const isActive: boolean = current.kind === "tool" && current.techId === node.techId;
    select(isActive ? { kind: "none" } : { kind: "tool", techId: node.techId });
  };

  return (
    <group position={node.position as [number, number, number]}>
      <group ref={float}>
        <TechBadge techId={node.techId} size={size} opacity={state === "dimmed" ? 0.3 : 1} onClick={choose} {...pointer} />
        <SpaceLabel position={[0, -size * 0.62, 0]} far={150} offsetY={6}>
          <button type="button" className="tool-tag" data-state={state} onClick={(): void => choose()}>
            {getTech(node.techId).name}
          </button>
        </SpaceLabel>
      </group>
    </group>
  );
}

export function ToolConstellation(): JSX.Element {
  const { tx } = useI18n();
  const selection = useUniverse((state) => state.selection);
  const [hovered, setHovered] = useState<TechId | null>(null);
  const activeTool: TechId | null = selection.kind === "tool" ? selection.techId : hovered;
  const linked: ReadonlySet<TechId> = useMemo((): Set<TechId> => {
    const set: Set<TechId> = new Set();
    if (!activeTool) return set;
    TOOL_LINKS.forEach((link: ToolLink): void => {
      if (link.from === activeTool) set.add(link.to);
      if (link.to === activeTool) set.add(link.from);
    });
    return set;
  }, [activeTool]);

  const stateOf = (techId: TechId): ToolStarProps["state"] => {
    if (!activeTool) return "idle";
    if (techId === activeTool) return "active";
    return linked.has(techId) ? "linked" : "dimmed";
  };

  return (
    <group>
      {TOOL_LINKS.map((link: ToolLink): JSX.Element => {
        const touches: boolean = activeTool !== null && (link.from === activeTool || link.to === activeTool);
        const from = (NODE_BY_TECH.get(link.from) as ToolNode).position;
        const to = (NODE_BY_TECH.get(link.to) as ToolNode).position;
        return (
          <group key={`${link.from}-${link.to}`}>
            <Line
              points={[from as [number, number, number], to as [number, number, number]]}
              color={touches ? "#ffb36b" : "#9a9486"}
              lineWidth={touches ? 2.2 : 1}
              transparent
              opacity={touches ? 0.95 : activeTool ? 0.08 : 0.3}
            />
            <SpaceLabel position={midpoint(link)} far={150} visible={touches && selection.kind === "tool"} collide>
              <span className="link-tag">{tx(link.relation)}</span>
            </SpaceLabel>
          </group>
        );
      })}
      {TOOL_NODES.map((node: ToolNode, index: number): JSX.Element => (
        <ToolStar key={node.techId} node={node} index={index} state={stateOf(node.techId)} onHover={setHovered} />
      ))}
    </group>
  );
}

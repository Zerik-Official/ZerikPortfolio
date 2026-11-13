/**
 * Registry of DOM labels pinned to 3D anchors.
 *
 * The 3D scene registers anchors and label content; a single DOM layer renders
 * the content and a single per-frame projector positions every label. This
 * replaces one React root per label.
 */
import type { ReactNode } from "react";
import type { Object3D } from "three";
import { create } from "zustand";

export interface LabelPlacement {
  anchor: Object3D | null;
  far: number;
  near: number;
  visible: boolean;
  offsetY: number;
  /** Hidden while it would overlap another colliding label placed first. */
  collide: boolean;
  /** Higher wins collisions and is drawn on top (e.g. the hovered planet). */
  priority: number;
  /** Smoothed collision visibility in [0, 1], owned by the projector. */
  fade: number;
}

export const labelPlacements: Map<string, LabelPlacement> = new Map();

/** DOM nodes rendered by `LabelLayer`, keyed like the placements. */
export const labelElements: Map<string, HTMLDivElement> = new Map();

interface LabelContentStore {
  contents: ReadonlyMap<string, ReactNode>;
  setContent: (id: string, content: ReactNode) => void;
  removeContent: (id: string) => void;
}

export const useLabelContents = create<LabelContentStore>()((set) => ({
  contents: new Map(),
  setContent: (id: string, content: ReactNode): void =>
    set((state) => {
      const next: Map<string, ReactNode> = new Map(state.contents);
      next.set(id, content);
      return { contents: next };
    }),
  removeContent: (id: string): void =>
    set((state) => {
      const next: Map<string, ReactNode> = new Map(state.contents);
      next.delete(id);
      return { contents: next };
    }),
}));

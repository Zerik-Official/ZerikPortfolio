import { create } from "zustand";

import type { ChapterId } from "@/data/journey";
import type { TechId } from "@/data/types";
import { getSystem } from "@/lib/layout";

export type Focus =
  | { readonly kind: "none" }
  | { readonly kind: "galaxy"; readonly id: string }
  | { readonly kind: "system"; readonly id: string }
  | { readonly kind: "blackhole"; readonly techId: TechId };

export type Selection =
  | { readonly kind: "none" }
  | { readonly kind: "tool"; readonly techId: TechId }
  | { readonly kind: "asteroid"; readonly id: string };

interface UniverseStore {
  focus: Focus;
  selection: Selection;
  projectId: string | null;
  chapter: ChapterId;
  hovering: boolean;
  setFocus: (focus: Focus) => void;
  goBack: () => void;
  select: (selection: Selection) => void;
  openProject: (id: string) => void;
  closeProject: () => void;
  setChapter: (chapter: ChapterId) => void;
  setHovering: (hovering: boolean) => void;
}

const NO_FOCUS: Focus = { kind: "none" };
const NO_SELECTION: Selection = { kind: "none" };

export const useUniverse = create<UniverseStore>()((set, get) => ({
  focus: NO_FOCUS,
  selection: NO_SELECTION,
  projectId: null,
  chapter: "ignition",
  hovering: false,
  setFocus: (focus: Focus): void => set({ focus, selection: NO_SELECTION }),
  goBack: (): void => {
    const { focus, projectId } = get();
    if (projectId) {
      set({ projectId: null });
      return;
    }
    if (focus.kind === "system") {
      const galaxyId: string | undefined = getSystem(focus.id)?.galaxyId;
      set({ focus: galaxyId ? { kind: "galaxy", id: galaxyId } : NO_FOCUS });
      return;
    }
    set({ focus: NO_FOCUS, selection: NO_SELECTION });
  },
  select: (selection: Selection): void => set({ selection }),
  openProject: (id: string): void => set({ projectId: id }),
  closeProject: (): void => set({ projectId: null }),
  setChapter: (chapter: ChapterId): void => {
    if (get().chapter !== chapter) set({ chapter, selection: NO_SELECTION });
  },
  setHovering: (hovering: boolean): void => {
    if (get().hovering !== hovering) set({ hovering });
  },
}));

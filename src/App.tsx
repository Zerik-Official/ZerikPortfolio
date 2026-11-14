import { type JSX, useEffect } from "react";

import { KEYFRAMES } from "@/data/journey";
import { useDocumentLocale } from "@/i18n/useI18n";
import { useUniverse } from "@/state/store";
import { Contact } from "@/ui/Contact";
import { ExploreToggle } from "@/ui/ExploreToggle";
import { FocusPanel } from "@/ui/FocusPanel";
import { Hud } from "@/ui/Hud";
import { LabelLayer } from "@/ui/LabelLayer";
import { ProjectDossier } from "@/ui/ProjectDossier";
import { ProjectIndex } from "@/ui/ProjectIndex";
import { SelectionCard } from "@/ui/SelectionCard";
import { About, ChapterTitle, Intro } from "@/ui/StoryOverlays";

const SCROLL_PER_STOP_VH: number = 115;

export function App(): JSX.Element {
  useDocumentLocale();
  useEffect((): (() => void) => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      const store = useUniverse.getState();
      if (store.exploring) store.setExploring(false);
      else if (store.projectId || store.focus.kind !== "none") store.goBack();
      else store.select({ kind: "none" });
    };
    window.addEventListener("keydown", onKey);
    return (): void => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div aria-hidden="true" style={{ height: `${(KEYFRAMES.length - 1) * SCROLL_PER_STOP_VH + 100}vh` }} />
      <LabelLayer />
      <main>
        <Intro />
        <About />
        <ChapterTitle />
        <ExploreToggle />
        <Contact />
        <ProjectIndex />
      </main>
      <Hud />
      <FocusPanel />
      <SelectionCard />
      <ProjectDossier />
    </>
  );
}

import type { JSX } from "react";

import { ASTEROIDS } from "@/data/learning";
import { getTech } from "@/data/techs";
import type { Asteroid, Project, TechId, ToolLink } from "@/data/types";
import { useI18n } from "@/i18n/useI18n";
import { linksOfTool, projectsUsingTool } from "@/lib/layout";
import { type Selection, useUniverse } from "@/state/store";
import { TechChip } from "@/ui/TechChip";

function ToolDetails({ techId }: { readonly techId: TechId }): JSX.Element {
  const { m, tx } = useI18n();
  const openProject = useUniverse((state) => state.openProject);
  const select = useUniverse((state) => state.select);
  const links: readonly ToolLink[] = linksOfTool(techId);
  const projects: readonly Project[] = projectsUsingTool(techId);
  return (
    <>
      <div className="flex items-center gap-3">
        <TechChip techId={techId} />
        <span className="serif text-[#cfc8ba]">{tx(getTech(techId).description)}</span>
      </div>
      {links.length > 0 && (
        <ul className="mt-4 mb-0 list-none p-0">
          {links.map((link: ToolLink): JSX.Element => {
            const other: TechId = link.from === techId ? link.to : link.from;
            return (
              <li key={`${link.from}-${link.to}`} className="flex items-baseline gap-3 border-t border-line py-2">
                <button
                  type="button"
                  className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[0.72rem] tracking-[0.2em] text-amber uppercase"
                  onClick={(): void => select({ kind: "tool", techId: other })}
                >
                  {getTech(other).name}
                </button>
                <span className="serif text-[1rem] text-[#d9d2c4]">{tx(link.relation)}</span>
              </li>
            );
          })}
        </ul>
      )}
      {projects.length > 0 && (
        <div className="mt-3">
          <h3 className="kicker mb-2 font-light">{m.selection.usedBy}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {projects.map((project: Project): JSX.Element => (
              <button key={project.id} type="button" className="text-link cursor-pointer border-x-0 border-t-0 bg-transparent" onClick={(): void => openProject(project.id)}>
                {project.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function AsteroidDetails({ asteroid }: { readonly asteroid: Asteroid }): JSX.Element {
  const { m, tx } = useI18n();
  return (
    <>
      <div className="flex items-center gap-3">
        <TechChip techId={asteroid.techId} />
        <h2 className="m-0 text-[0.8rem] font-light tracking-[0.2em] uppercase">{asteroid.name}</h2>
      </div>
      <p className="serif mt-3 mb-4 text-[1.05rem] text-[#d9d2c4]">{tx(asteroid.description)}</p>
      <a className="pill" href={asteroid.repo} target="_blank" rel="noopener noreferrer">
        {m.selection.viewRepository}
      </a>
    </>
  );
}

/** Bottom card for the tapped tool or learning asteroid. */
export function SelectionCard(): JSX.Element | null {
  const { m } = useI18n();
  const selection: Selection = useUniverse((state) => state.selection);
  const select = useUniverse((state) => state.select);
  if (selection.kind === "none") return null;
  const asteroid: Asteroid | undefined =
    selection.kind === "asteroid" ? ASTEROIDS.find((item: Asteroid): boolean => item.id === selection.id) : undefined;
  return (
    <aside
      aria-live="polite"
      aria-label={selection.kind === "tool" ? getTech(selection.techId).name : asteroid?.name}
      className="panel fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] left-1/2 z-30 max-h-[52vh] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-y-auto rounded-2xl px-6 py-5 md:top-1/2 md:right-24 md:bottom-auto md:left-auto md:max-h-[76vh] md:w-[380px] md:translate-x-0 md:-translate-y-1/2"
    >
      <button
        type="button"
        onClick={(): void => select({ kind: "none" })}
        className="absolute top-3.5 right-4 cursor-pointer border-0 bg-transparent text-[0.62rem] tracking-[0.3em] text-mute uppercase hover:text-ink"
      >
        {m.selection.close}
      </button>
      {selection.kind === "tool" && <ToolDetails techId={selection.techId} />}
      {asteroid && <AsteroidDetails asteroid={asteroid} />}
    </aside>
  );
}

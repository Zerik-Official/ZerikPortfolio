import { type JSX, useEffect, useRef } from "react";

import { getProject } from "@/data/projects";
import { getTech } from "@/data/techs";
import type { Localized, Project, SolarSystem, TechId } from "@/data/types";
import { type I18n, useI18n } from "@/i18n/useI18n";
import { getGalaxy, getSystem } from "@/lib/layout";
import { useUniverse } from "@/state/store";
import { TechChip } from "@/ui/TechChip";

function ChipGroup({ title, techIds }: { readonly title: string; readonly techIds: readonly TechId[] }): JSX.Element | null {
  if (techIds.length === 0) return null;
  return (
    <section className="mt-5" aria-label={title}>
      <h3 className="kicker mb-2 font-light">{title}</h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {techIds.map((techId: TechId): JSX.Element => (
          <li key={techId}>
            <TechChip techId={techId} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function locationOf(system: SolarSystem | undefined, { m, tx }: I18n): string {
  if (!system) return "";
  const galaxy = getGalaxy(system.galaxyId);
  const name: string = tx(system.name);
  return galaxy ? `${m.panel.galaxy(getTech(galaxy.techId).name)} › ${m.panel.system(name)}` : name;
}

/** Drawer with the full record of a project (a planet). */
export function ProjectDossier(): JSX.Element {
  const i18n: I18n = useI18n();
  const { m, tx } = i18n;
  const projectId: string | null = useUniverse((state) => state.projectId);
  const closeProject = useUniverse((state) => state.closeProject);
  const closeButton = useRef<HTMLButtonElement>(null);
  const project: Project | undefined = projectId ? getProject(projectId) : undefined;
  const open: boolean = project !== undefined;

  useEffect((): void => {
    if (open) closeButton.current?.focus({ preventScroll: true });
  }, [open, projectId]);

  const home: SolarSystem | undefined = project ? getSystem(project.systemId) : undefined;
  const routes: readonly SolarSystem[] = project
    ? project.routes.map((id: string): SolarSystem | undefined => getSystem(id)).filter((system): system is SolarSystem => system !== undefined)
    : [];

  return (
    <aside
      role="dialog"
      aria-hidden={!open}
      aria-label={open ? undefined : m.dossier.label}
      aria-labelledby={open ? "dossier-title" : undefined}
      inert={!open}
      className={`panel fixed top-0 right-0 bottom-0 z-40 box-border w-full overflow-y-auto border-y-0 border-r-0 px-8 pt-14 pb-10 transition-transform duration-700 ease-orbit sm:w-[460px] ${open ? "translate-x-0" : "translate-x-[104%]"}`}
    >
      <button
        ref={closeButton}
        type="button"
        onClick={closeProject}
        className="absolute top-5 right-6 cursor-pointer border-0 bg-transparent text-[0.68rem] tracking-[0.3em] text-mute uppercase hover:text-ink"
      >
        {m.dossier.close}
      </button>
      {project && (
        <article>
          <p className="kicker m-0">{locationOf(home, i18n)}</p>
          <h2 id="dossier-title" className="wide mt-3 mb-2 text-2xl">
            {project.name}
          </h2>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-2.5 py-1 text-[0.62rem] tracking-[0.25em] uppercase ${project.status === "completed" ? "border-[#7ee0a0]/60 text-[#9be8b5]" : "border-amber/60 text-amber"}`}
            >
              {project.status === "completed" ? m.dossier.completed : m.dossier.inProgress}
            </span>
            <span className="serif text-[#cfc8ba]">{tx(project.tagline)}</span>
          </div>
          {project.role && (
            <p className="kicker mt-0 mb-4 text-amber">
              {project.repo ? m.dossier.team : m.dossier.company} · {tx(project.role)}
            </p>
          )}
          <p className="m-0 text-[1.02rem] leading-relaxed text-[#e0d9cb]">{tx(project.description)}</p>
          {project.highlights.length > 0 && (
            <ul className="mt-5 mb-0 list-none p-0">
              {project.highlights.map((highlight: Localized): JSX.Element => (
                <li key={highlight.en} className="serif my-1.5 border-l border-amber pl-3 text-[1.05rem] text-[#d9d2c4]">
                  {tx(highlight)}
                </li>
              ))}
            </ul>
          )}
          <ChipGroup title={m.dossier.moons} techIds={project.moons} />
          <ChipGroup title={m.dossier.databases} techIds={project.databases} />
          <ChipGroup title={m.dossier.tools} techIds={project.tools} />
          {routes.length > 0 && (
            <section className="mt-5" aria-label={m.dossier.wormholes}>
              <h3 className="kicker mb-2 font-light">{m.dossier.wormholes}</h3>
              <p className="serif m-0 text-[1.02rem] text-[#d9d2c4]">
                {m.dossier.alsoConnects(routes.map((system: SolarSystem): string => locationOf(system, i18n)).join(m.dossier.and))}
              </p>
            </section>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {project.repo ? (
              <a className="pill" href={project.repo} target="_blank" rel="noopener noreferrer">
                {m.dossier.repository}
              </a>
            ) : (
              <span className="pill pill--ghost cursor-default hover:bg-transparent hover:text-ink">{m.dossier.privateRepository}</span>
            )}
            {project.demo && (
              <a className="pill pill--ghost" href={project.demo} target="_blank" rel="noopener noreferrer">
                {m.dossier.live}
              </a>
            )}
          </div>
        </article>
      )}
    </aside>
  );
}

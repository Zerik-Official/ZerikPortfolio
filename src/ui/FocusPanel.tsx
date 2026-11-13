import { type JSX, useState } from "react";

import { getTech } from "@/data/techs";
import type { Asteroid, Galaxy, Localized, Project, SolarSystem, TechId } from "@/data/types";
import { BLACK_HOLES } from "@/data/universe";
import { type I18n, useI18n } from "@/i18n/useI18n";
import {
  asteroidsOfTech,
  getGalaxy,
  getSystem,
  projectsInGalaxy,
  projectsInSystem,
  projectsRoutedTo,
  projectsUsingDatabase,
  systemsOf,
} from "@/lib/layout";
import { type Focus, useUniverse } from "@/state/store";
import { TechChip } from "@/ui/TechChip";

function systemName(id: string, tx: (text: Localized) => string): string {
  const system: SolarSystem | undefined = getSystem(id);
  return system ? tx(system.name) : "";
}

function ProjectList({ projects, meta }: { readonly projects: readonly Project[]; readonly meta: (project: Project) => string }): JSX.Element {
  const openProject = useUniverse((state) => state.openProject);
  return (
    <ul className="m-0 list-none p-0">
      {projects.map((project: Project): JSX.Element => (
        <li key={project.id}>
          <button type="button" className="list-button" aria-haspopup="dialog" onClick={(): void => openProject(project.id)}>
            <span className="list-button__name">{project.name}</span>
            <span className="list-button__meta">{meta(project)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function AsteroidLinks({ asteroids }: { readonly asteroids: readonly Asteroid[] }): JSX.Element | null {
  const { m } = useI18n();
  if (asteroids.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="kicker mb-2 font-light">{m.panel.beltTraining}</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {asteroids.map((asteroid: Asteroid): JSX.Element => (
          <a key={asteroid.id} className="text-link" href={asteroid.repo} target="_blank" rel="noopener noreferrer">
            {asteroid.name}
          </a>
        ))}
      </div>
    </div>
  );
}

function GalaxyBody({ galaxy }: { readonly galaxy: Galaxy }): JSX.Element {
  const { m } = useI18n();
  const setFocus = useUniverse((state) => state.setFocus);
  const systems: readonly SolarSystem[] = systemsOf(galaxy.id);
  const companionTechs: TechId[] = galaxy.techId === "javascript" ? ["javascript", "html", "css"] : [galaxy.techId];
  return (
    <>
      {systems.length > 0 && <h3 className="kicker mb-1 font-light">{m.panel.solarSystems}</h3>}
      <ul className="m-0 list-none p-0">
        {systems.map((system: SolarSystem): JSX.Element => {
          const count: number = projectsInSystem(system.id).length;
          const linked: number = projectsRoutedTo(system.id).length;
          return (
            <li key={system.id}>
              <button type="button" className="list-button" onClick={(): void => setFocus({ kind: "system", id: system.id })}>
                <TechChip techId={system.starTechId} />
                <span className="list-button__meta">
                  {m.labels.projects(count)}
                  {linked > 0 ? ` · ${m.labels.linked(linked)}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <AsteroidLinks asteroids={asteroidsOfTech(companionTechs)} />
    </>
  );
}

function SystemBody({ system }: { readonly system: SolarSystem }): JSX.Element {
  const { m, tx } = useI18n();
  const residents: readonly Project[] = projectsInSystem(system.id);
  const visitors: readonly Project[] = projectsRoutedTo(system.id);
  return (
    <>
      {residents.length > 0 && <h3 className="kicker mb-1 font-light">{m.panel.planets}</h3>}
      <ProjectList projects={residents} meta={(project: Project): string => tx(project.tagline)} />
      {visitors.length > 0 && (
        <>
          <h3 className="kicker mt-6 mb-1 font-light">{m.panel.wormholes}</h3>
          <ProjectList projects={visitors} meta={(project: Project): string => m.panel.livesIn(systemName(project.systemId, tx))} />
        </>
      )}
    </>
  );
}

function BlackHoleBody({ techId }: { readonly techId: TechId }): JSX.Element {
  const { m, tx } = useI18n();
  const projects: readonly Project[] = projectsUsingDatabase(techId);
  return (
    <>
      {projects.length > 0 && <h3 className="kicker mb-1 font-light">{m.panel.inOrbit}</h3>}
      <ProjectList projects={projects} meta={(project: Project): string => systemName(project.systemId, tx)} />
      <AsteroidLinks asteroids={asteroidsOfTech([techId])} />
    </>
  );
}

interface PanelContent {
  readonly trail: readonly string[];
  readonly title: string;
  readonly description: string;
  readonly body: JSX.Element;
}

function contentFor(focus: Focus, { m, tx }: I18n): PanelContent | null {
  if (focus.kind === "galaxy") {
    const galaxy: Galaxy | undefined = getGalaxy(focus.id);
    if (!galaxy) return null;
    const name: string = getTech(galaxy.techId).name;
    const total: number = projectsInGalaxy(galaxy.id).length;
    return {
      trail: [m.panel.universe, m.panel.galaxy(name)],
      title: name,
      description: `${tx(galaxy.description)}${total > 0 ? ` ${m.panel.totalProjects(total)}` : ""}`,
      body: <GalaxyBody galaxy={galaxy} />,
    };
  }
  if (focus.kind === "system") {
    const system: SolarSystem | undefined = getSystem(focus.id);
    const galaxy: Galaxy | undefined = system ? getGalaxy(system.galaxyId) : undefined;
    if (!system || !galaxy) return null;
    return {
      trail: [m.panel.universe, m.panel.galaxy(getTech(galaxy.techId).name), m.panel.system(tx(system.name))],
      title: tx(system.name),
      description: tx(system.description),
      body: <SystemBody system={system} />,
    };
  }
  if (focus.kind === "blackhole") {
    const hole = BLACK_HOLES.find((item): boolean => item.techId === focus.techId);
    if (!hole) return null;
    return {
      trail: [m.panel.universe, m.panel.blackHoles, getTech(hole.techId).name],
      title: getTech(hole.techId).name,
      description: tx(hole.description),
      body: <BlackHoleBody techId={hole.techId} />,
    };
  }
  return null;
}

const COMPACT_QUERY: string = "(max-width: 767px)";

function startsCollapsed(): boolean {
  return typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches;
}

/**
 * Side panel describing the focused galaxy, system or black hole. Visitors can
 * collapse it to its title so the body behind it stays visible; on phones it
 * starts collapsed.
 */
export function FocusPanel(): JSX.Element | null {
  const i18n: I18n = useI18n();
  const { m } = i18n;
  const focus: Focus = useUniverse((state) => state.focus);
  const goBack = useUniverse((state) => state.goBack);
  const setFocus = useUniverse((state) => state.setFocus);
  const [collapsed, setCollapsed] = useState<boolean>(startsCollapsed);
  const content: PanelContent | null = contentFor(focus, i18n);
  if (!content) return null;
  return (
    <aside
      aria-labelledby="focus-title"
      className={`panel fixed inset-x-3 bottom-3 z-30 overflow-y-auto rounded-2xl px-6 py-5 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-6 md:max-h-[78vh] md:w-[380px] md:-translate-y-1/2 ${collapsed ? "max-h-none" : "max-h-[46vh]"}`}
    >
      <button
        type="button"
        onClick={(): void => setCollapsed((value: boolean): boolean => !value)}
        aria-expanded={!collapsed}
        aria-controls="focus-details"
        aria-label={collapsed ? m.panel.show : m.panel.hide}
        title={collapsed ? m.panel.show : m.panel.hide}
        className="absolute top-3 right-3 grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-black/40 text-ink transition-colors hover:border-amber hover:text-amber"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <nav aria-label={m.panel.breadcrumb} className="pr-10">
        <ol className="kicker m-0 mb-3 flex list-none flex-wrap gap-x-2 p-0">
          {content.trail.map((step: string, index: number): JSX.Element => {
            const current: boolean = index === content.trail.length - 1;
            return (
              <li key={step} aria-current={current ? "location" : undefined} className={current ? "text-ink" : undefined}>
                {index > 0 && (
                  <span aria-hidden="true" className="mr-2 text-amber">
                    ›
                  </span>
                )}
                {step}
              </li>
            );
          })}
        </ol>
      </nav>
      <h2 id="focus-title" className="wide m-0 text-2xl">
        {content.title}
      </h2>
      <div id="focus-details" hidden={collapsed}>
        <p className="serif mt-2 mb-5 text-[1.08rem] leading-snug text-[#d9d2c4]">{content.description}</p>
        {content.body}
      </div>
      <div className={`flex flex-wrap gap-3 ${collapsed ? "mt-4" : "mt-6"}`}>
        <button type="button" className="pill pill--ghost" onClick={goBack}>
          {m.panel.back}
        </button>
        {focus.kind === "system" && (
          <button type="button" className="pill pill--ghost" onClick={(): void => setFocus({ kind: "none" })}>
            {m.panel.backToJourney}
          </button>
        )}
      </div>
    </aside>
  );
}

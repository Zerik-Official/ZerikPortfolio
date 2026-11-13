import type { JSX } from "react";

import { SOCIAL_LINKS } from "@/data/journey";
import { ASTEROIDS } from "@/data/learning";
import { PROJECTS } from "@/data/projects";
import type { Asteroid, Project, SocialLink } from "@/data/types";
import { useI18n } from "@/i18n/useI18n";

/** Text version of the universe for screen readers and search engines. */
export function ProjectIndex(): JSX.Element {
  const { m, tx } = useI18n();
  return (
    <section className="sr-only" aria-label={m.index.label}>
      <h2>{m.index.projects}</h2>
      <ul>
        {PROJECTS.map((project: Project): JSX.Element => (
          <li key={project.id}>
            {project.repo ? <a href={project.repo}>{project.name}</a> : project.name}: {tx(project.description)}
            {project.demo && (
              <>
                {" "}
                <a href={project.demo}>{m.index.demo(project.name)}</a>
              </>
            )}
          </li>
        ))}
      </ul>
      <h2>{m.index.training}</h2>
      <ul>
        {ASTEROIDS.map((asteroid: Asteroid): JSX.Element => (
          <li key={asteroid.id}>
            <a href={asteroid.repo}>{asteroid.name}</a>: {tx(asteroid.description)}
          </li>
        ))}
      </ul>
      <h2>{m.index.contact}</h2>
      <ul>
        {SOCIAL_LINKS.map((link: SocialLink): JSX.Element => (
          <li key={link.id}>
            <a href={link.url}>{link.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

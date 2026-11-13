import type { JSX } from "react";

import { getTech } from "@/data/techs";
import type { TechId } from "@/data/types";
import { getIconUrl } from "@/lib/icons";

export function TechChip({ techId }: { readonly techId: TechId }): JSX.Element {
  const tech = getTech(techId);
  const icon: string | null = getIconUrl(techId);
  return (
    <span className="chip">
      {icon ? <img src={icon} alt="" loading="lazy" /> : <span className="chip__fallback">{tech.name.slice(0, 2)}</span>}
      {tech.name}
    </span>
  );
}

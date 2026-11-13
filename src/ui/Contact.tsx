import type { JSX } from "react";

import { SOCIAL_LINKS } from "@/data/journey";
import type { SocialLink } from "@/data/types";
import { useOverlayFade } from "@/hooks/useOverlayFade";
import { useI18n } from "@/i18n/useI18n";
import { SOCIAL_ICONS } from "@/lib/icons";
import { clamp } from "@/lib/math";
import { type JourneyState, LAST_STOP } from "@/state/journey";

/** Final chapter: the ship reaches home and opens three channels. */
export function Contact(): JSX.Element {
  const { m } = useI18n();
  const ref = useOverlayFade<HTMLElement>(
    (state: JourneyState): number => clamp((state.stop - (LAST_STOP - 0.45)) / 0.35) * (1 - clamp(state.focusBlend * 3)),
  );
  return (
    <section ref={ref} aria-labelledby="contact-title" className="overlay scrim inset-0 z-20 flex flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="serif legible m-0 text-[clamp(1rem,2vw,1.3rem)] text-mute">{m.contact.kicker}</p>
      <h2 id="contact-title" className="wide legible m-0 mr-[-0.45em] text-[clamp(1.4rem,4.4vw,3rem)]">
        {m.contact.title}
      </h2>
      <p className="serif legible m-0 max-w-[36ch] text-[clamp(1.05rem,2vw,1.35rem)] text-[#e0d9cb]">{m.contact.body}</p>
      <ul className="m-0 mt-2 grid w-full max-w-[720px] list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
        {SOCIAL_LINKS.map((link: SocialLink): JSX.Element => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${link.label}: ${link.handle}`}
              className="panel group flex items-center gap-4 rounded-2xl px-5 py-4 text-left text-ink no-underline transition-colors duration-300 hover:border-amber sm:flex-col sm:items-center sm:text-center"
            >
              <img src={SOCIAL_ICONS[link.id]} alt="" className="size-11 rounded-full bg-[#f3ede2] p-2" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[0.78rem] tracking-[0.3em] uppercase group-hover:text-amber">{link.label} ↗</span>
                <span className="serif truncate text-[#cfc8ba]">{link.handle}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

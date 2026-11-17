import type { JSX } from "react";

import { CHAPTERS, type Chapter } from "@/data/journey";
import { useOverlayFade } from "@/hooks/useOverlayFade";
import type { Credential } from "@/i18n/messages";
import { useI18n } from "@/i18n/useI18n";
import { clamp, windowRamp } from "@/lib/math";
import type { JourneyState } from "@/state/journey";
import { useUniverse } from "@/state/store";

function visibleOutsideFocus(state: JourneyState): number {
  return 1 - clamp(state.focusBlend * 3);
}

export function Intro(): JSX.Element {
  const { m } = useI18n();
  const ref = useOverlayFade<HTMLElement>((state: JourneyState): number => (1 - clamp(state.stop / 0.45)) * visibleOutsideFocus(state));
  return (
    <section ref={ref} aria-labelledby="intro-title" className="overlay scrim inset-0 flex flex-col items-center justify-center px-5 text-center">
      <p className="serif legible mb-9 text-[clamp(1.1rem,2.4vw,1.6rem)] text-mute">{m.intro.tagline}</p>
      <h1 id="intro-title" className="wide legible m-0 mr-[-0.35em] text-[clamp(2.6rem,11vw,8rem)] leading-[1.05] tracking-[0.35em]">
        Andrés
        <span className="mt-[0.9em] mr-[-1em] block text-[0.34em] tracking-[1em] text-amber">Zerik</span>
      </h1>
      <p className="legible mt-10 text-[0.8rem] tracking-[0.35em] text-mute">{m.intro.role}</p>
      <p className="serif legible mt-6 mb-0 max-w-[34ch] text-[clamp(1.05rem,2vw,1.35rem)] leading-snug text-ink/85">“{m.intro.quote}”</p>
      <p className="legible mt-10 text-[0.7rem] tracking-[0.4em] text-mute">
        {m.intro.scroll}
        <i aria-hidden="true" className="mx-auto mt-3.5 block h-12 w-px bg-linear-to-b from-amber to-transparent [animation:drip_2s_ease-in-out_infinite]" />
      </p>
    </section>
  );
}

export function About(): JSX.Element {
  const { m, tx } = useI18n();
  const pilot: Chapter | undefined = CHAPTERS.find((item: Chapter): boolean => item.id === "pilot");
  const ref = useOverlayFade<HTMLElement>((state: JourneyState): number => windowRamp(state.stop, 0.45, 0.85, 1.2, 1.6) * visibleOutsideFocus(state));
  return (
    <section
      ref={ref}
      aria-label={pilot ? tx(pilot.name) : undefined}
      className="overlay scrim inset-0 flex flex-col items-center justify-center gap-[2.5vh] px-[7vw] md:flex-row md:items-center md:gap-[5vw]"
    >
      <div className="w-full max-w-[40ch] md:max-w-[34rem]">
        <p className="serif legible m-0 text-[1.1rem] leading-[1.35] md:text-[clamp(1.35rem,1.9vw,1.8rem)] md:leading-[1.4]">{m.about.bio}</p>
        <dl className="m-0 mt-4 grid gap-2.5 md:mt-8 md:gap-3">
          {m.about.credentials.map((credential: Credential): JSX.Element => (
            <div key={credential.label} className="legible border-t border-line pt-2.5 md:pt-3">
              <dt className="kicker text-amber">{credential.label}</dt>
              <dd className="m-0 mt-1 text-[0.85rem] leading-snug text-ink md:mt-1.5 md:text-[0.95rem]">{credential.title}</dd>
              <dd className="m-0 mt-0.5 text-[0.78rem] tracking-[0.08em] text-mute">{credential.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="w-full max-w-[40ch] md:w-auto md:max-w-[30ch]">
        <p className="kicker legible m-0 mb-3 hidden text-amber md:block">{m.about.focusTitle}</p>
        <ul className="m-0 list-none p-0 text-[0.85rem] text-ink/85 md:text-base">
          {m.about.focus.map((item: string): JSX.Element => (
            <li key={item} className="legible my-1.5 border-l border-amber pl-3.5 leading-snug md:my-2 md:leading-normal">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ChapterTitle(): JSX.Element {
  const { tx } = useI18n();
  const chapterId = useUniverse((state) => state.chapter);
  const chapter: Chapter | undefined = CHAPTERS.find((item: Chapter): boolean => item.id === chapterId);
  const ref = useOverlayFade<HTMLDivElement>((state: JourneyState): number => {
    const nearest: number = Math.round(state.stop);
    const closeness: number = 1 - clamp((Math.abs(state.stop - nearest) - 0.08) * 2.6);
    return chapter?.subtitle ? closeness * visibleOutsideFocus(state) : 0;
  });
  return (
    <div ref={ref} role="status" className="overlay chapter-band inset-x-0 top-0 px-5 pt-[11vh] pb-12 text-center">
      <h2 className="wide legible m-0 text-[clamp(1.2rem,4vw,2.8rem)]">{chapter ? tx(chapter.name) : ""}</h2>
      <p className="serif legible mt-3 mb-0 text-[clamp(1rem,2vw,1.35rem)] text-ink">{chapter?.subtitle ? tx(chapter.subtitle) : ""}</p>
    </div>
  );
}

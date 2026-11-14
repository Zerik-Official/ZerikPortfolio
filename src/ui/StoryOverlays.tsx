import type { JSX } from "react";

import { CHAPTERS, type Chapter } from "@/data/journey";
import { useOverlayFade } from "@/hooks/useOverlayFade";
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
      className="overlay scrim inset-0 flex flex-wrap content-center items-center justify-center gap-[3vh] px-[7vw] md:gap-[6vw]"
    >
      <div className="max-w-[30ch]">
        <p className="serif legible m-0 text-[1.25rem] leading-[1.35] md:text-[clamp(1.4rem,2.8vw,2.1rem)]">{m.about.bio}</p>
        <p className="kicker legible mt-5 mb-0">{m.about.study}</p>
        <p className="kicker legible mt-2 mb-0">{m.about.job}</p>
      </div>
      <ul className="m-0 max-w-[34ch] list-none p-0 text-[0.92rem] text-ink/85 md:text-base">
        {m.about.focus.map((item: string): JSX.Element => (
          <li key={item} className="legible my-2 border-l border-amber pl-3.5 leading-normal">
            {item}
          </li>
        ))}
      </ul>
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
      <p className="serif legible mt-3 mb-0 text-[clamp(1rem,2vw,1.35rem)] text-ink/80">{chapter?.subtitle ? tx(chapter.subtitle) : ""}</p>
    </div>
  );
}

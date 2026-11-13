import { type JSX, useMemo, useRef, useState } from "react";

import { Soundtrack } from "@/audio/Soundtrack";
import { CHAPTERS, type Chapter, firstKeyframeOf } from "@/data/journey";
import { useJourneyFrame } from "@/hooks/useJourneyFrame";
import { useLocale } from "@/i18n/locale";
import { useI18n } from "@/i18n/useI18n";
import { type JourneyState, scrollToStop } from "@/state/journey";
import { useUniverse } from "@/state/store";

const LIGHT_YEARS_PER_UNIT: number = 0.46;

function formatClock(seconds: number): string {
  const whole: number = Math.floor(seconds);
  return `T+ ${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

const PILL: string =
  "pointer-events-auto cursor-pointer rounded-full border border-mute bg-black/40 px-2.5 py-1.5 tracking-[inherit] text-ink uppercase backdrop-blur-sm hover:border-amber md:px-3.5 md:py-2";

export function Hud(): JSX.Element {
  const { locale, m, tx } = useI18n();
  const toggleLocale = useLocale((state) => state.toggleLocale);
  const chapterId = useUniverse((state) => state.chapter);
  const clock = useRef<HTMLSpanElement>(null);
  const distance = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const soundtrack: Soundtrack = useMemo((): Soundtrack => new Soundtrack(), []);
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>((): number => soundtrack.volume);
  const chapter: Chapter | undefined = CHAPTERS.find((item: Chapter): boolean => item.id === chapterId);

  useJourneyFrame((state: JourneyState): void => {
    if (clock.current) clock.current.textContent = formatClock(state.elapsed);
    if (distance.current) distance.current.textContent = `${(state.distance * LIGHT_YEARS_PER_UNIT).toFixed(1)} ${m.hud.lightYears}`;
    if (bar.current) bar.current.style.transform = `scaleY(${state.current})`;
  });

  const toggleSound = (): void => {
    if (soundtrack.playing) {
      soundtrack.stop();
      setSoundOn(false);
      return;
    }
    setSoundOn(true);
    soundtrack.start().catch((): void => {
      soundtrack.stop();
      setSoundOn(false);
    });
  };

  const travelTo = (target: Chapter): void => {
    const store = useUniverse.getState();
    store.closeProject();
    store.setFocus({ kind: "none" });
    window.requestAnimationFrame((): void => scrollToStop(firstKeyframeOf(target.id)));
  };

  return (
    <div className="overlay inset-0 z-10 text-[0.55rem] tracking-[0.18em] text-mute uppercase md:text-[0.68rem] md:tracking-[0.3em]">
      <div className="legible fixed top-[calc(18px+env(safe-area-inset-top,0px))] left-3.5 md:left-[22px]">
        <b className="mb-1.5 block font-light text-ink">Zerik</b>
        <span aria-live="polite">{chapter ? tx(chapter.name) : ""}</span>
      </div>
      <div aria-hidden="true" className="legible fixed bottom-[calc(18px+env(safe-area-inset-bottom,0px))] left-3.5 leading-loose md:left-[22px]">
        <i className="mr-2 inline-block size-1.5 rounded-full bg-amber [animation:blink_1.25s_steps(1)_infinite]" />
        <span ref={clock}>T+ 00:00</span>
        <br />
        <span ref={distance}>0.0 {m.hud.lightYears}</span>
      </div>
      <nav aria-label={m.hud.chapters} className="pointer-events-auto fixed top-1/2 right-3 flex -translate-y-1/2 flex-col items-end gap-3 md:right-[22px] md:gap-4">
        {CHAPTERS.slice(1).map((item: Chapter): JSX.Element => {
          const active: boolean = item.id === chapterId;
          const name: string = tx(item.name);
          return (
            <button
              key={item.id}
              type="button"
              onClick={(): void => travelTo(item)}
              aria-current={active ? "step" : undefined}
              aria-label={name}
              className={`group legible flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0.5 tracking-[inherit] uppercase ${active ? "text-ink" : "text-inherit"}`}
            >
              <span aria-hidden="true" className={`hidden transition-opacity duration-300 md:inline ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                {name}
              </span>
              <span aria-hidden="true" className={`size-[7px] rounded-full border ${active ? "border-amber bg-amber" : "border-mute"}`} />
            </button>
          );
        })}
      </nav>
      <div className="fixed right-3 bottom-[calc(14px+env(safe-area-inset-bottom,0px))] flex gap-2 md:right-[22px]">
        <button type="button" onClick={toggleLocale} aria-label={m.hud.language} lang={locale === "es" ? "en" : "es"} className={PILL}>
          <span aria-hidden="true">
            <span className={locale === "es" ? "text-amber" : undefined}>ES</span> / <span className={locale === "en" ? "text-amber" : undefined}>EN</span>
          </span>
        </button>
        <div
          className={`pointer-events-auto flex items-center rounded-full border bg-black/40 backdrop-blur-sm transition-[border-color] ${soundOn ? "border-amber/60" : "border-mute hover:border-amber"}`}
        >
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className="cursor-pointer rounded-full border-0 bg-transparent px-2.5 py-1.5 tracking-[inherit] text-ink uppercase md:px-3.5 md:py-2"
          >
            {m.hud.sound(soundOn)}
          </button>
          <div className={`overflow-hidden transition-[width,opacity] duration-500 ease-orbit ${soundOn ? "w-20 opacity-100 md:w-24" : "w-0 opacity-0"}`}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={(event): void => {
                const next: number = Number(event.target.value) / 100;
                setVolume(next);
                soundtrack.setVolume(next);
              }}
              aria-label={m.hud.volume}
              aria-valuetext={`${Math.round(volume * 100)}%`}
              tabIndex={soundOn ? 0 : -1}
              disabled={!soundOn}
              className="volume-range mr-3 w-16 md:w-20"
            />
          </div>
        </div>
      </div>
      <div ref={bar} aria-hidden="true" className="fixed top-0 left-0 h-full w-0.5 origin-top scale-y-0 bg-amber opacity-70" />
    </div>
  );
}

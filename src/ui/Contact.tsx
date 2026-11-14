import { type JSX, type MouseEvent, useEffect } from "react";

import { SOCIAL_LINKS } from "@/data/journey";
import type { SocialLink } from "@/data/types";
import { useOverlayFade } from "@/hooks/useOverlayFade";
import { useI18n } from "@/i18n/useI18n";
import { SOCIAL_ICONS } from "@/lib/icons";
import { clamp } from "@/lib/math";
import { type SignalPhase, useContactSignal } from "@/state/contactSignal";
import { type JourneyState, LAST_STOP } from "@/state/journey";

function isTransmitting(phase: SignalPhase): boolean {
  return phase === "connecting" || phase === "flight";
}

/** Modified or middle clicks keep the browser's own behaviour (new tab, window…). */
function wantsDefault(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function SkipButton({ className = "" }: { readonly className?: string }): JSX.Element {
  const { m } = useI18n();
  const skip = useContactSignal((state) => state.skip);
  return (
    <button type="button" className={`pill px-3.5! py-1.5! text-[0.62rem]! whitespace-nowrap ${className}`} onClick={skip}>
      {m.contact.skip} ›
    </button>
  );
}

function ChannelCard({ link }: { readonly link: SocialLink }): JSX.Element {
  const { m } = useI18n();
  const phase: SignalPhase = useContactSignal((state) => state.phase);
  const current: SocialLink | null = useContactSignal((state) => state.link);
  const canSkip: boolean = useContactSignal((state) => state.plays > 0);
  const transmit = useContactSignal((state) => state.transmit);
  const retry: boolean = useContactSignal((state) => state.blocked?.id === link.id);
  const loading: boolean = current?.id === link.id && isTransmitting(phase);
  const busy: boolean = phase !== "idle";

  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (wantsDefault(event)) return;
    // After a blocked tab, the card itself opens the link right away, within the tap.
    if (retry && !busy) {
      useContactSignal.setState({ blocked: null });
      return;
    }
    event.preventDefault();
    transmit(link);
  };

  return (
    <li className="relative">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        aria-label={`${link.label}: ${link.handle}`}
        aria-busy={loading}
        aria-disabled={busy && !loading}
        onClick={onClick}
        data-loading={loading}
        className="panel group flex items-center gap-4 rounded-2xl px-5 py-4 text-left text-ink no-underline transition-colors duration-300 hover:border-amber data-[loading=true]:border-amber sm:flex-col sm:items-center sm:text-center"
      >
        <img src={SOCIAL_ICONS[link.id]} alt="" className="size-11 rounded-full bg-[#f3ede2] p-2" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-[0.78rem] tracking-[0.3em] uppercase group-hover:text-amber">{link.label} ↗</span>
          {loading ? (
            <span role="status" className="serif flex items-center gap-2.5 text-amber sm:justify-center">
              <i aria-hidden="true" className="spinner" />
              {m.contact.connecting}
            </span>
          ) : retry ? (
            <span className="serif text-amber">{m.contact.blocked}</span>
          ) : (
            <span className="serif truncate text-[#cfc8ba]">{link.handle}</span>
          )}
        </span>
      </a>
      {loading && canSkip && <SkipButton className="absolute top-1/2 right-4 -translate-y-1/2 sm:top-3 sm:right-3 sm:translate-y-0" />}
    </li>
  );
}

/** Floating loader while the camera is away carrying the signal. */
function SignalStatus(): JSX.Element | null {
  const { m } = useI18n();
  const phase: SignalPhase = useContactSignal((state) => state.phase);
  const link: SocialLink | null = useContactSignal((state) => state.link);
  const canSkip: boolean = useContactSignal((state) => state.plays > 0);
  if (phase !== "flight" || !link) return null;
  return (
    <div role="status" className="overlay inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-30 flex justify-center px-5">
      <div className="panel pointer-events-auto flex items-center gap-3 rounded-full py-2 pr-2 pl-4 text-[0.7rem] tracking-[0.22em] text-ink uppercase">
        <i aria-hidden="true" className="spinner" />
        <span className={canSkip ? "" : "pr-2"}>{m.contact.transmitting(link.label)}</span>
        {canSkip && <SkipButton />}
      </div>
    </div>
  );
}

/** Final chapter: the ship reaches home and opens three channels. */
export function Contact(): JSX.Element {
  const { m } = useI18n();
  const phase: SignalPhase = useContactSignal((state) => state.phase);
  const ref = useOverlayFade<HTMLElement>(
    (state: JourneyState): number =>
      clamp((state.stop - (LAST_STOP - 0.45)) / 0.35) * (1 - clamp(state.focusBlend * 3)) * (1 - clamp(state.cinematicBlend * 1.6)),
  );

  useEffect((): void => {
    document.documentElement.classList.toggle("transmitting", phase !== "idle");
  }, [phase]);

  return (
    <>
      <section ref={ref} aria-labelledby="contact-title" className="overlay scrim inset-0 z-20 flex flex-col items-center justify-center gap-6 px-5 text-center">
        <p className="serif legible m-0 text-[clamp(1rem,2vw,1.3rem)] text-mute">{m.contact.kicker}</p>
        <h2 id="contact-title" className="wide legible m-0 mr-[-0.45em] text-[clamp(1.4rem,4.4vw,3rem)]">
          {m.contact.title}
        </h2>
        <p className="serif legible m-0 max-w-[36ch] text-[clamp(1.05rem,2vw,1.35rem)] text-[#e0d9cb]">{m.contact.body}</p>
        <ul className="m-0 mt-2 grid w-full max-w-[720px] list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3">
          {SOCIAL_LINKS.map((link: SocialLink): JSX.Element => (
            <ChannelCard key={link.id} link={link} />
          ))}
        </ul>
      </section>
      <SignalStatus />
    </>
  );
}

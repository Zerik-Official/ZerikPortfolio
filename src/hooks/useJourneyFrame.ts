import { useEffect, useRef } from "react";

import { type JourneyState, subscribeJourney } from "@/state/journey";

/** Runs a callback on every rendered frame with the shared journey state. */
export function useJourneyFrame(callback: (state: JourneyState) => void): void {
  const callbackRef = useRef<(state: JourneyState) => void>(callback);
  callbackRef.current = callback;
  useEffect((): (() => void) => subscribeJourney((state: JourneyState): void => callbackRef.current(state)), []);
}

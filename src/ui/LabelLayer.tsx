import { type JSX, type ReactNode, useCallback } from "react";

import { labelElements, useLabelContents } from "@/state/labels";

function LabelSlot({ id, content }: { readonly id: string; readonly content: ReactNode }): JSX.Element {
  const attach = useCallback(
    (element: HTMLDivElement | null): void => {
      if (element) labelElements.set(id, element);
      else labelElements.delete(id);
    },
    [id],
  );
  return (
    <div ref={attach} className="absolute top-0 left-0 will-change-transform" style={{ opacity: 0, visibility: "hidden" }}>
      {content}
    </div>
  );
}

/** DOM layer that renders the labels registered by the 3D scene. */
export function LabelLayer(): JSX.Element {
  const contents = useLabelContents((state) => state.contents);
  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {[...contents].map(([id, content]: [string, ReactNode]): JSX.Element => (
        <LabelSlot key={id} id={id} content={content} />
      ))}
    </div>
  );
}

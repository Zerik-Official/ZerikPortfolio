import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/App";
import "@/index.css";

const Universe = lazy(async () => ({ default: (await import("@/scene/Universe")).Universe }));

const root: HTMLElement | null = document.getElementById("root");
if (!root) throw new Error("Root element #root was not found");

/**
 * The WebGL scene stays outside StrictMode: its DOM labels each own a React
 * root, and StrictMode's development double-mount unmounts them mid-render.
 */
createRoot(root).render(
  <>
    <Suspense fallback={null}>
      <Universe />
    </Suspense>
    <StrictMode>
      <App />
    </StrictMode>
  </>,
);

"use client";

import { useEffect, useId, useRef, useState } from "react";

let mermaidModulePromise: Promise<typeof import("mermaid")> | null = null;

function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid");
  }
  return mermaidModulePromise;
}

export function MermaidDiagram({ chart }: { chart: string }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadMermaid()
      .then(async ({ default: mermaid }) => {
        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: isDark ? "dark" : "default",
          fontFamily: "inherit",
        });
        const { svg } = await mermaid.render(`chatbot-diagram-${rawId}`, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [chart, rawId]);

  if (failed) return null;

  return (
    <div
      ref={containerRef}
      className="my-1.5 overflow-x-auto rounded-lg bg-white p-2 [&_svg]:mx-auto dark:bg-zinc-950"
    />
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { GeneratedGraphic } from "@/types";

function parseSvgDimensions(svg: string) {
  const viewBoxMatch = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.-]+) ([\d.-]+)"/);
  if (viewBoxMatch) {
    return { width: parseFloat(viewBoxMatch[1]), height: parseFloat(viewBoxMatch[2]) };
  }
  const widthMatch = svg.match(/width="([\d.]+)"/);
  const heightMatch = svg.match(/height="([\d.]+)"/);
  return {
    width: widthMatch ? parseFloat(widthMatch[1]) : 1200,
    height: heightMatch ? parseFloat(heightMatch[1]) : 720,
  };
}

const DEFAULT_PROMPT = "the tension between trust and control across a decentralized network";

export default function Home() {
  const PAGE_SIZE = 4; // how many thumbnails per “page”

const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
const [color, setColor] = useState("#6ef5c3");
const [currentGraphic, setCurrentGraphic] = useState<GeneratedGraphic | null>(null);
const [history, setHistory] = useState<GeneratedGraphic[]>([]);
const [galleryOffset, setGalleryOffset] = useState(0); // index of first visible item
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const brandGlyph = useMemo(() => "[LEDGR//GRID]", []);

const visibleHistory = useMemo(
  () => history.slice(galleryOffset, galleryOffset + PAGE_SIZE),
  [history, galleryOffset],
);

const canPrev = galleryOffset > 0;
const canNext = galleryOffset + PAGE_SIZE < history.length;

  const handleGenerate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!prompt.trim()) {
        setError("Add a prompt to render a graphic.");
        return;
      }
      setError(null);
      setLoading(true);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, color }),
        });

        if (!response.ok) {
          const message = (await response.json()).error || "Failed to generate.";
          throw new Error(message);
        }

        const data = await response.json();
        const graphic: GeneratedGraphic = data.graphic;
        setCurrentGraphic(graphic);
        setHistory((prev) => [graphic, ...prev].slice(0, 20)); // keep up to 20 in memory
        setGalleryOffset(0); // always show the newest page
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    },
    [prompt, color],
  );

  const downloadSVG = useCallback((graphic: GeneratedGraphic) => {
    const blob = new Blob([graphic.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = graphic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `${safeTitle || "graphic"}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadPNG = useCallback((graphic: GeneratedGraphic) => {
    const SCALE = 3;
    const { width, height } = parseSvgDimensions(graphic.svg);
    const svgBlob = new Blob([graphic.svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas unavailable in this browser.");
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("PNG export failed.");
          return;
        }
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const safeTitle = graphic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        link.href = downloadUrl;
        link.download = `${safeTitle || "graphic"}.png`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      setError("Unable to read SVG for PNG export.");
      URL.revokeObjectURL(url);
    };

    image.src = url;
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,255,200,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(120,160,255,0.05),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-4 border border-white/5 rounded-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-40" />

      <div className="relative mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">render pipeline</p>
            <h1 className="text-2xl font-semibold tracking-[0.18em] text-slate-50">{brandGlyph}</h1>
          </div>
          <div className="text-xs text-slate-400 font-mono">PROMPT FEED / v0.1</div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 border border-white/5 rounded-2xl" />
            <div className="pointer-events-none absolute inset-6 border border-white/5 rounded-xl opacity-60" />

            <form className="relative space-y-6" onSubmit={handleGenerate}>
              <div>
                <label className="mb-2 block text-sm font-mono uppercase tracking-[0.2em] text-slate-300">
                  Describe the signal
                </label>
                <textarea
                  className="min-h-[180px] w-full resize-none rounded-lg border border-white/10 bg-neutral-900/70 p-4 font-mono text-sm text-slate-100 shadow-inner outline-none ring-1 ring-transparent transition focus:ring-emerald-400/60"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 3-step funnel diagram with arrows and haloed nodes"
                />
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Primary hue</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border border-white/10 bg-neutral-900"
                  />
                  <span className="text-xs text-slate-400 font-mono">{color.toUpperCase()}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative inline-flex items-center justify-center gap-3 rounded-full border border-emerald-400/50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-50 disabled:cursor-not-allowed disabled:border-emerald-900 disabled:text-emerald-900"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${loading ? "bg-emerald-200 animate-pulse" : "bg-emerald-400"}`}
                  />
                  {loading ? "Rendering…" : "Generate"}
                </button>
              </div>

              <p className="text-[11px] font-mono leading-relaxed text-slate-500">
                Tips: describe structures (network, timeline, funnel) or vibes (entropy vs order). Style stays HUD / dystopian / minimal
                with negative space. Use the color picker to seed glows and strokes.
              </p>

              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}
            </form>
          </section>

          <section className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-neutral-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.22em] text-slate-400">
              <span>Render viewport</span>
              <span className="text-emerald-300">{currentGraphic ? currentGraphic.title : "Awaiting input"}</span>
            </div>
            <div className="relative flex-1 rounded-xl border border-white/10 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:16px_16px] px-4 py-6">
              <div className="absolute inset-0 rounded-xl border border-white/5" />
              {currentGraphic ? (
                <div
                  className="relative mx-auto flex max-h-[440px] min-h-[320px] items-center justify-center overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: currentGraphic.svg }}
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-500">
                  Visuals land here. Feed the pipeline.
                </div>
              )}
            </div>
            {currentGraphic && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
                <button
                  onClick={() => downloadSVG(currentGraphic)}
                  className="rounded-full border border-white/15 px-4 py-2 uppercase tracking-[0.2em] transition hover:border-emerald-300 hover:text-emerald-100"
                >
                  Download SVG
                </button>
                <button
                  onClick={() => downloadPNG(currentGraphic)}
                  className="rounded-full border border-white/15 px-4 py-2 uppercase tracking-[0.2em] transition hover:border-emerald-300 hover:text-emerald-100"
                >
                  Download PNG
                </button>
                <span className="text-emerald-300">{currentGraphic.styleDescription}</span>
              </div>
            )}

            {history.length > 0 && (
  <div className="mt-4">
    <div className="mb-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
      <span>Session gallery</span>
      <div className="flex items-center gap-3">
        <span>
          {galleryOffset + 1}–{Math.min(galleryOffset + PAGE_SIZE, history.length)} / {history.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setGalleryOffset((offset) => Math.max(0, offset - PAGE_SIZE))}
            disabled={!canPrev}
            className="rounded-full border border-white/15 px-2 py-1 text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() =>
              setGalleryOffset((offset) =>
                offset + PAGE_SIZE < history.length ? offset + PAGE_SIZE : offset,
              )
            }
            disabled={!canNext}
            className="rounded-full border border-white/15 px-2 py-1 text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
    <div className="flex gap-3 pb-2">
      {visibleHistory.map((item) => (
        <div
          key={item.createdAt + item.title}
          className="group relative w-[140px] cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-neutral-900/60 p-2 transition hover:border-emerald-300/60"
          onClick={() => setCurrentGraphic(item)}
        >
          <div
            className="pointer-events-none flex h-28 items-center justify-center overflow-hidden"
            dangerouslySetInnerHTML={{ __html: item.svg }}
          />
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="truncate uppercase tracking-[0.15em]">{item.title}</span>
            <span className="text-emerald-300">tap</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
          </section>
        </div>
      </div>
    </main>
  );
}

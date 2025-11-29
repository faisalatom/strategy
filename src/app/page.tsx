"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
  const [mode, setMode] = useState<"grid" | "studio">("grid");
  const PAGE_SIZE = 4; // how many thumbnails per “page”

const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
const [color, setColor] = useState("#6ef5c3");
const [currentGraphic, setCurrentGraphic] = useState<GeneratedGraphic | null>(null);
const [history, setHistory] = useState<GeneratedGraphic[]>([]);
const [galleryOffset, setGalleryOffset] = useState(0); // index of first visible item
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const colorInputRef = useRef<HTMLInputElement | null>(null);

const brandGlyph = useMemo(() => "[ANGLE//OM]", []);

const visibleHistory = useMemo(
  () => history.slice(galleryOffset, galleryOffset + PAGE_SIZE),
  [history, galleryOffset],
);

const canPrev = galleryOffset > 0;
const canNext = galleryOffset + PAGE_SIZE < history.length;

  const toggleMode = () => {
  setMode((prev) => (prev === "grid" ? "studio" : "grid"));
};
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
  // upscale factor for sharper PNGs
  const SCALE = 3;

  const { width, height } = parseSvgDimensions(graphic.svg);
  const svgBlob = new Blob([graphic.svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();
  image.crossOrigin = "anonymous";

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Canvas unavailable in this browser.");
      return;
    }

    // draw at higher resolution
    ctx.scale(SCALE, SCALE);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    // reset transform (so this canvas can be reused safely, just in case)
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.toBlob(
      (blob) => {
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
      },
      "image/png",
      0.96 // quality hint
    );

    URL.revokeObjectURL(url);
  };

  image.onerror = () => {
    setError("Unable to read SVG for PNG export.");
    URL.revokeObjectURL(url);
  };

  image.src = url;
}, []);

  return (
  <main
    className={`angle-root angle-root--${mode} min-h-screen text-slate-100 relative overflow-hidden`}
  >
  {/* ANGLE background field */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(111,231,255,0.14),transparent_45%),radial-gradient(circle_at_90%_100%,rgba(110,245,195,0.10),transparent_45%)]" />
    <div className="pointer-events-none absolute inset-6 rounded-[2.5rem] border border-white/5" />
    <div className="hud-grid-background pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:120px_120px] opacity-40" />
        <div className="angle-diagonal" />
    <div className="angle-noise" />
    
      <div className="relative mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <header className="mb-8 flex items-center justify-between">
  <div>
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">angle // render pipeline</p>
    <h1 className="text-2xl font-semibold tracking-[0.18em] text-slate-50">{brandGlyph}</h1>
  </div>
  <div className="text-right text-xs text-slate-400 font-mono space-y-1">
      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
    <span>PROMPT FEED / v0.1</span>
    <button
      type="button"
      onClick={toggleMode}
      className="angle-mode-toggle"
    >
      <span
        className={
          mode === "grid"
            ? "angle-mode-pill angle-mode-pill--active"
            : "angle-mode-pill"
        }
      >
        GRID
      </span>
      <span
        className={
          mode === "studio"
            ? "angle-mode-pill angle-mode-pill--active"
            : "angle-mode-pill"
        }
      >
        STUDIO
      </span>
    </button>
  </div>
    <div className="text-[10px] tracking-[0.2em] text-emerald-300/80">
      X: {String(prompt.length).padStart(3, "0")} • Y: {String(history.length).padStart(3, "0")}
    </div>
  </div>
</header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="angle-panel relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
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
<div className="flex flex-col gap-2">
  <label className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
    Primary hue
  </label>

  {/* ANGLE color pill */}
  <button
    type="button"
    className="angle-color-shell"
    onClick={() => colorInputRef.current?.click()}
  >
    <span
      className="angle-color-swatch"
      style={{ background: color }}
    />
    <span className="angle-color-chip">
      <span className="angle-color-dot" />
      <span className="angle-color-code">{color.toUpperCase()}</span>
    </span>

    {/* Hidden native color input (no white square) */}
    <input
      ref={colorInputRef}
      type="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
      className="angle-color-input"
      style={{ position: "absolute", left: "-9999px", opacity: 0 }}
      aria-label="Primary hue"
    />
  </button>

  {/* Hex text field */}
  <input
    type="text"
    value={color}
    onChange={(e) => setColor(e.target.value)}
    className="w-[130px] rounded border border-white/10 bg-black/40 px-2 py-1 text-[11px] font-mono tracking-[0.18em] text-emerald-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400/70"
    spellCheck={false}
  />
</div>
                <button
                  type="submit"
                  disabled={loading}
                  className="angle-generate relative inline-flex items-center justify-center gap-3 rounded-full border border-emerald-400/50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-50 disabled:cursor-not-allowed disabled:border-emerald-900 disabled:text-emerald-900"
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

          <section className="angle-panel relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-neutral-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.22em] text-slate-400">
              <span>Render viewport</span>
              <span className="text-emerald-300">{currentGraphic ? currentGraphic.title : "Awaiting input"}</span>
            </div>
            <div className="angle-viewport relative flex-1 rounded-xl border border-white/10 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:16px_16px] px-4 py-6">
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
                       <div className="flex flex-col gap-3 text-xs font-mono text-slate-300">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => currentGraphic && downloadSVG(currentGraphic)}
                  className="rounded-full border border-white/15 px-4 py-2 uppercase tracking-[0.2em] transition hover:border-emerald-300 hover:text-emerald-100 disabled:opacity-40"
                  disabled={!currentGraphic}
                >
                  Download SVG
                </button>
                <button
                  onClick={() => currentGraphic && downloadPNG(currentGraphic)}
                  className="rounded-full border border-white/15 px-4 py-2 uppercase tracking-[0.2em] transition hover:border-emerald-300 hover:text-emerald-100 disabled:opacity-40"
                  disabled={!currentGraphic}
                >
                  Download PNG
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                  <p className="mb-1">Prompt length</p>
                  <p className="text-xs text-slate-100 tracking-normal">
                    {prompt.length} chars
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                  <p className="mb-1">Structure</p>
                  <p className="text-xs text-slate-100 tracking-normal">
                    {currentGraphic?.tags?.[0]?.toUpperCase() ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                  <p className="mb-1">Angle hue</p>
                  <p className="text-xs text-emerald-300 tracking-normal">
                    {color.toUpperCase()}
                  </p>
                </div>
              </div>

              {currentGraphic && (
                <p className="mt-1 text-[10px] text-emerald-300 tracking-[0.16em] uppercase">
                  {currentGraphic.styleDescription}
                </p>
              )}
            </div>

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
          className="group relative min-w-[140px] flex-1 cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-neutral-900/60 p-2 transition-transform duration-200 hover:border-emerald-300/70 hover:scale-[1.03]"
          onClick={() => setCurrentGraphic(item)}
        >
          <div
            className="pointer-events-none flex h-28 items-center justify-center overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity"
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

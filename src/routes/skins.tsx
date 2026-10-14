import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/launcher/primitives";

export const Route = createFileRoute("/skins")({
  head: () => ({
    meta: [
      { title: "Skins — NOVA Launcher" },
      { name: "description", content: "Preview and manage the appearance of your Minecraft character." },
      { property: "og:title", content: "Skins — NOVA Launcher" },
      { property: "og:description", content: "Manage the appearance of your Minecraft character." },
    ],
  }),
  component: Skins,
});

// [sx, sy, w, h, dx, dy] — front-facing parts of a 64x64 (or 64x32) skin, drawn on a 16x32 grid
const PARTS: [number, number, number, number, number, number][] = [
  [8, 8, 8, 8, 4, 0], // head
  [20, 20, 8, 12, 4, 8], // body
  [44, 20, 4, 12, 0, 8], // right arm
  [44, 20, 4, 12, 12, 8], // left arm (mirrored source for legacy)
  [4, 20, 4, 12, 4, 20], // right leg
  [4, 20, 4, 12, 8, 20], // left leg
];
const OVERLAY: [number, number, number, number, number, number][] = [[40, 8, 8, 8, 4, 0]];

function SkinPreview({ img }: { img: HTMLImageElement }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const s = 10;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 160, 320);
    for (const [sx, sy, w, h, dx, dy] of [...PARTS, ...OVERLAY]) ctx.drawImage(img, sx, sy, w, h, dx * s, dy * s, w * s, h * s);
  }, [img]);
  return <canvas ref={ref} width={160} height={320} className="h-64 w-32 [image-rendering:pixelated]" aria-label="Skin front preview" />;
}

function Silhouette() {
  return (
    <svg viewBox="0 0 16 32" className="h-64 w-32" aria-hidden>
      <g className="fill-elevated stroke-border" strokeWidth="0.2">
        <rect x="4" y="0" width="8" height="8" rx="0.5" />
        <rect x="4" y="8" width="8" height="12" />
        <rect x="0" y="8" width="4" height="12" />
        <rect x="12" y="8" width="4" height="12" />
        <rect x="4" y="20" width="4" height="12" />
        <rect x="8" y="20" width="4" height="12" />
      </g>
    </svg>
  );
}

function Skins() {
  const input = useRef<HTMLInputElement>(null);
  const [skin, setSkin] = useState<{ img: HTMLImageElement; name: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (skin) URL.revokeObjectURL(skin.url); }, [skin]);

  const onFile = (file?: File) => {
    setError(null);
    if (!file) return;
    if (file.type !== "image/png") return setError("Skins must be PNG images.");
    if (file.size > 1024 * 1024) return setError("That file is too large for a skin (max 1 MB).");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ok = img.width === 64 && (img.height === 64 || img.height === 32);
      if (!ok) { URL.revokeObjectURL(url); return setError(`Expected a 64×64 or 64×32 skin, got ${img.width}×${img.height}.`); }
      setSkin({ img, name: file.name, url });
    };
    img.onerror = () => { URL.revokeObjectURL(url); setError("That file couldn't be read as an image."); };
    img.src = url;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Skins" subtitle="Manage the appearance of your Minecraft character." />
      <Panel className="p-0">
        <div className="grid md:grid-cols-[280px_1fr]">
          <div className="flex items-center justify-center border-b border-border bg-background/50 p-8 md:border-b-0 md:border-r">
            {skin ? <SkinPreview img={skin.img} /> : <Silhouette />}
          </div>
          <div className="flex flex-col justify-center p-8">
            <h2 className="text-section font-semibold">{skin ? skin.name : "No skin imported"}</h2>
            <p className="mt-1 max-w-md text-body text-muted-foreground">
              {skin
                ? "Previewed locally on this device. It hasn't been uploaded to your Minecraft profile."
                : "Import a standard 64×64 PNG skin file to preview it here. Uploading to Minecraft will be available after account sign-in is integrated."}
            </p>
            <div className="mt-6 flex gap-2">
              <Button onClick={() => input.current?.click()}><Upload /> {skin ? "Import another" : "Import skin"}</Button>
              {skin && <Button variant="ghost" onClick={() => setSkin(null)}><X /> Clear</Button>}
            </div>
            <input ref={input} type="file" accept="image/png" className="sr-only" aria-label="Skin file" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
            {error && (
              <p role="alert" className="mt-4 flex items-center gap-2 text-meta text-destructive">
                <AlertCircle className="size-3.5" /> {error}
              </p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

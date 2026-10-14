import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FolderOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, StatusPill, selectContentClass, selectItemClass, selectTriggerClass } from "@/components/launcher/primitives";
import { VersionSelect } from "@/components/launcher/VersionSelect";
import { ModLoaderSelect } from "@/components/launcher/ModLoaderSelect";
import { useLauncher } from "@/lib/launcher/store";
import { RAM_MAX, RAM_MIN } from "@/lib/launcher/catalog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NOVA Launcher" },
      { name: "description", content: "Customize how the NOVA Minecraft launcher works." },
      { property: "og:title", content: "Settings — NOVA Launcher" },
      { property: "og:description", content: "Customize how NOVA works." },
    ],
  }),
  component: Settings,
});

function Row({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-body font-medium">{label}</label>
        {hint && <p className="mt-0.5 text-meta text-faint">{hint}</p>}
      </div>
      <div className="w-full shrink-0 sm:w-64">{children}</div>
    </div>
  );
}

function Settings() {
  const { prefs, setPref, setSignInOpen } = useLauncher();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Customize how NOVA works." />

      <Panel title="General">
        <div className="divide-y divide-border">
          <Row label="Interface theme" hint="More themes may come later." htmlFor="set-theme">
            <Select value="dark" disabled>
              <SelectTrigger id="set-theme" className={selectTriggerClass}><SelectValue /></SelectTrigger>
              <SelectContent className={selectContentClass}><SelectItem value="dark" className={selectItemClass}>Dark</SelectItem></SelectContent>
            </Select>
          </Row>
          <Row label="Reduce motion" hint="Minimizes interface transitions." htmlFor="set-motion">
            <div className="flex justify-end"><Switch id="set-motion" checked={prefs.reduceMotion} onCheckedChange={(v) => setPref("reduceMotion", v)} /></div>
          </Row>
          <Row label="On startup" hint="Applies once the desktop app exists." htmlFor="set-startup">
            <Select value={prefs.startup} onValueChange={(v) => setPref("startup", v as "home" | "last")}>
              <SelectTrigger id="set-startup" className={selectTriggerClass}><SelectValue /></SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="home" className={selectItemClass}>Open Home</SelectItem>
                <SelectItem value="last" className={selectItemClass}>Open last screen</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </div>
      </Panel>

      <Panel title="Game">
        <div className="divide-y divide-border">
          <Row label="Default version" hint="Demonstration versions only." htmlFor="set-version">
            <VersionSelect id="set-version" value={prefs.defaultVersion} onChange={(v) => setPref("defaultVersion", v)} />
          </Row>
          <Row label="Memory allocation" hint={`${prefs.ramGb} GB · provisional`}>
            <Slider aria-label="Memory allocation in gigabytes" min={RAM_MIN} max={RAM_MAX} step={1} value={[prefs.ramGb]} onValueChange={(v) => setPref("ramGb", v[0] ?? 4)} className="py-2" />
          </Row>
          <Row label="Preferred mod loader" htmlFor="set-loader">
            <ModLoaderSelect id="set-loader" value={prefs.modLoader} onChange={(v) => setPref("modLoader", v)} />
          </Row>
        </div>
      </Panel>

      <Panel title="Downloads">
        <div className="divide-y divide-border">
          <Row label="Download directory" hint="Folder access needs the desktop app.">
            <div className="flex h-10 items-center gap-2 rounded-md border border-dashed border-border px-3 text-meta text-faint">
              <FolderOpen className="size-4" /> Not available in browser
            </div>
          </Row>
          <Row label="Parallel downloads" hint={`${prefs.concurrency} at a time · placeholder`}>
            <Slider aria-label="Parallel downloads" min={1} max={8} step={1} value={[prefs.concurrency]} onValueChange={(v) => setPref("concurrency", v[0] ?? 4)} className="py-2" />
          </Row>
        </div>
      </Panel>

      <Panel title="Account">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-10 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground"><User className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium">Microsoft account</p>
            <p className="text-meta text-faint">Not signed in</p>
          </div>
          <StatusPill>Signed out</StatusPill>
          <Button variant="secondary" onClick={() => setSignInOpen(true)}>Sign in</Button>
        </div>
      </Panel>
    </div>
  );
}

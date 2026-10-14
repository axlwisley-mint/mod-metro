import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Download, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DemoTag, EmptyState, FieldLabel, PageHeader, Panel, StatusPill } from "@/components/launcher/primitives";
import { VersionSelect } from "@/components/launcher/VersionSelect";
import { ModLoaderSelect } from "@/components/launcher/ModLoaderSelect";
import { useLauncher } from "@/lib/launcher/store";
import { MOD_LOADERS, RAM_MAX, RAM_MIN, versionLabel } from "@/lib/launcher/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — NOVA Launcher" },
      { name: "description", content: "Choose a Minecraft Java Edition version and prepare your world with NOVA." },
      { property: "og:title", content: "NOVA — Minecraft Java Launcher" },
      { property: "og:description", content: "A minimal, premium launcher for Minecraft Java Edition." },
    ],
  }),
  component: Home,
});

function CubeAccent() {
  return (
    <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-6 -top-6 hidden size-64 opacity-[0.07] sm:block" aria-hidden>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <path
            key={`${r}${c}`}
            d={`M${100 + (c - r) * 30} ${40 + (c + r) * 17} l30 17 -30 17 -30 -17z`}
            className="fill-none stroke-primary"
            strokeWidth="1.5"
          />
        )),
      )}
    </svg>
  );
}

function Home() {
  const { prefs, setPref, installations } = useLauncher();
  const loader = MOD_LOADERS.find((m) => m.id === prefs.modLoader)!;

  const onInstall = () =>
    toast("Installation isn't available yet", {
      description: prefs.selectedVersion
        ? `${versionLabel(prefs.selectedVersion)} will be installable once downloads are added.`
        : "Pick a version first. Real downloads arrive in a later stage.",
    });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Welcome back" subtitle="Your Minecraft, your way." aside={<StatusPill tone="warning">Prototype · Ready to configure</StatusPill>} />

      <section className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 md:p-8">
        <CubeAccent />
        <p className="text-tiny font-semibold tracking-[0.14em] text-primary">MINECRAFT JAVA EDITION</p>
        <h2 className="mt-2 text-[34px] font-semibold leading-tight tracking-tight">Minecraft</h2>
        <p className="mt-1 text-body text-muted-foreground">Choose your version. Prepare your world.</p>

        <div className="mt-7 flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-72">
            <FieldLabel htmlFor="home-version" hint={<DemoTag />}>Version</FieldLabel>
            <VersionSelect id="home-version" value={prefs.selectedVersion} onChange={(v) => setPref("selectedVersion", v)} className="h-11" />
          </div>
          <Button size="lg" onClick={onInstall} className="min-w-36">
            <Download /> Install
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="secondary" size="icon-lg" aria-label="Installation options">
                <Link to="/settings"><SlidersHorizontal /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="border border-border bg-elevated text-foreground">Installation options</TooltipContent>
          </Tooltip>
        </div>

        <p className="mt-5 flex items-center gap-2 text-meta text-faint">
          <span className="size-1.5 rounded-full bg-faint" />
          {prefs.selectedVersion ? `${versionLabel(prefs.selectedVersion)} selected · not installed` : "No version selected · nothing installed"}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Quick configuration" action={<Link to="/settings" className="text-meta font-medium text-primary hover:text-primary-hover">Advanced settings</Link>}>
          <div className="flex flex-col gap-6">
            <div>
              <FieldLabel htmlFor="home-loader">Mod loader</FieldLabel>
              <ModLoaderSelect id="home-loader" value={prefs.modLoader} onChange={(v) => setPref("modLoader", v)} />
              <p className="mt-2 text-meta text-faint">{loader.hint}</p>
            </div>
            <div>
              <FieldLabel hint={<span className="text-meta font-medium tabular-nums">{prefs.ramGb} GB allocated</span>}>Memory allocation</FieldLabel>
              <Slider aria-label="Memory allocation in gigabytes" min={RAM_MIN} max={RAM_MAX} step={1} value={[prefs.ramGb]} onValueChange={(v) => setPref("ramGb", v[0] ?? 4)} className="py-2" />
              <div className="mt-1 flex justify-between text-tiny text-faint">
                <span>{RAM_MIN} GB</span>
                <span>Provisional — system memory isn't detected yet</span>
                <span>{RAM_MAX} GB</span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Installation status">
          <EmptyState
            icon={<Boxes />}
            title={installations.length ? `${installations.length} prototype profile${installations.length > 1 ? "s" : ""}` : "No installations yet"}
            body={installations.length ? "Profiles are saved, but no game files have been downloaded." : "Your installed game versions will appear here."}
            action={<Button asChild variant="secondary"><Link to="/installations">Manage installations</Link></Button>}
          />
        </Panel>
      </div>
    </div>
  );
}

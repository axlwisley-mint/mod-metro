import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Boxes, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoTag, EmptyState, FieldLabel, PageHeader, Panel, dialogClass, inputClass, selectContentClass, selectItemClass, selectTriggerClass } from "@/components/launcher/primitives";
import { VersionSelect } from "@/components/launcher/VersionSelect";
import { ModLoaderSelect } from "@/components/launcher/ModLoaderSelect";
import { useLauncher } from "@/lib/launcher/store";
import { MOD_LOADERS, versionLabel } from "@/lib/launcher/catalog";
import type { ModLoader } from "@/lib/launcher/types";

export const Route = createFileRoute("/installations")({
  head: () => ({
    meta: [
      { title: "Installations — NOVA Launcher" },
      { name: "description", content: "Manage your Minecraft versions and profiles in NOVA." },
      { property: "og:title", content: "Installations — NOVA Launcher" },
      { property: "og:description", content: "Manage your Minecraft versions and profiles." },
    ],
  }),
  component: Installations,
});

function Installations() {
  const { installations, removeInstallation } = useLauncher();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = installations.filter((i) => i.name.toLowerCase().includes(q));
    return sort === "name" ? [...l].sort((a, b) => a.name.localeCompare(b.name)) : l;
  }, [installations, query, sort]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Installations"
        subtitle="Manage your Minecraft versions and profiles."
        aside={<Button onClick={() => setOpen(true)}><Plus /> Add installation</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input aria-label="Search installations" placeholder="Search installations" value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} pl-9`} />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Sort installations" className={`${selectTriggerClass} w-44`}><SelectValue /></SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectItem value="recent" className={selectItemClass}>Recently added</SelectItem>
            <SelectItem value="name" className={selectItemClass}>Name A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Panel className="p-0">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-section font-semibold">Installed on this device</h2>
          <span className="text-meta text-faint">0 detected</span>
        </div>
        <EmptyState icon={<Boxes />} title="No real installations detected" body="Game folders will be scanned once desktop file access is integrated." />
      </Panel>

      {installations.length > 0 && (
        <Panel title="Prototype profiles" action={<DemoTag />}>
          {list.length === 0 ? (
            <p className="text-body text-muted-foreground">No profiles match “{query}”.</p>
          ) : (
            <ul className="-my-2 divide-y divide-border">
              {list.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-elevated text-muted-foreground"><Boxes className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-medium">{i.name}</p>
                    <p className="text-meta text-faint">
                      {versionLabel(i.versionId)} · {MOD_LOADERS.find((m) => m.id === i.modLoader)?.label} · Not downloaded
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${i.name}`} onClick={() => removeInstallation(i.id)}><Trash2 /></Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <AddInstallationDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function AddInstallationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addInstallation } = useLauncher();
  const [name, setName] = useState("");
  const [version, setVersion] = useState<string | null>(null);
  const [loader, setLoader] = useState<ModLoader>("vanilla");
  const [errors, setErrors] = useState<{ name?: string; version?: string }>({});

  const reset = () => { setName(""); setVersion(null); setLoader("vanilla"); setErrors({}); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!name.trim()) err.name = "Give this installation a name.";
    if (!version) err.version = "Choose a Minecraft version.";
    setErrors(err);
    if (Object.keys(err).length) return;
    addInstallation({ name: name.trim().slice(0, 60), versionId: version!, modLoader: loader });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className={dialogClass}>
        <DialogTitle className="text-section font-semibold">Add installation</DialogTitle>
        <DialogDescription className="mt-1 text-body text-muted-foreground">
          Creates a profile only. No game files are downloaded in this prototype.
        </DialogDescription>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-5" noValidate>
          <div>
            <FieldLabel htmlFor="inst-name">Installation name</FieldLabel>
            <Input id="inst-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="e.g. Survival world" className={inputClass} aria-invalid={!!errors.name} />
            {errors.name && <p className="mt-1.5 text-meta text-destructive">{errors.name}</p>}
          </div>
          <div>
            <FieldLabel htmlFor="inst-version" hint={<DemoTag />}>Minecraft version</FieldLabel>
            <VersionSelect id="inst-version" value={version} onChange={setVersion} />
            {errors.version && <p className="mt-1.5 text-meta text-destructive">{errors.version}</p>}
          </div>
          <div>
            <FieldLabel htmlFor="inst-loader">Mod loader</FieldLabel>
            <ModLoaderSelect id="inst-loader" value={loader} onChange={setLoader} />
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create profile</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

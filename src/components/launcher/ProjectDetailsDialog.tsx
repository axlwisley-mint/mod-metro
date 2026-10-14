import { useEffect, useState } from "react";
import { Download, ExternalLink, Loader2, Package, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  PROVIDER_LABELS,
  formatCount,
  safeProviderUrl,
  type ProjectDetails,
  type ProjectSummary,
} from "@/lib/content/types";
import { fetchDetails } from "@/lib/content/search";
import { dialogClass } from "./primitives";

function ProviderBadge({ provider }: { provider: ProjectSummary["provider"] }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-sm border px-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
        provider === "modrinth"
          ? "border-primary/30 bg-accent-surface text-primary"
          : "border-warning/30 text-warning",
      )}
    >
      {PROVIDER_LABELS[provider]}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-2 text-meta">
      <span className="shrink-0 text-faint">{label}</span>
      <span className="text-right text-muted-foreground">{value}</span>
    </div>
  );
}

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectSummary | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [details, setDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !project) return;
    let cancelled = false;
    const ctrl = new AbortController();

    setLoading(true);
    setError(null);
    setDetails(null);

    fetchDetails(project, ctrl.signal)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .catch((e) => {
        if (cancelled || e?.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load project details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [open, project]);

  const url = safeProviderUrl(details?.pageUrl ?? project?.pageUrl, project?.provider ?? "modrinth");
  const providerLabel = project ? PROVIDER_LABELS[project.provider] : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogClass, "max-w-2xl p-0")}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-section font-semibold">
            {project?.title ?? "Project details"}
          </DialogTitle>
          {project && <ProviderBadge provider={project.provider} />}
        </div>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-5">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-meta">Loading details from {providerLabel}…</p>
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <p className="text-body text-muted-foreground">{error}</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (project) {
                      const ctrl = new AbortController();
                      setLoading(true);
                      setError(null);
                      fetchDetails(project, ctrl.signal)
                        .then(setDetails)
                        .catch((e) => setError(e?.message ?? "Failed to load."))
                        .finally(() => setLoading(false));
                    }
                  }}
                >
                  <RefreshCw /> Retry
                </Button>
              </div>
            )}

            {details && !loading && !error && (
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-elevated">
                    {details.iconUrl ? (
                      <img
                        src={details.iconUrl}
                        alt={details.title}
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-faint">
                        <Package className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-section font-semibold">{details.title}</h2>
                    {details.author && (
                      <p className="mt-0.5 text-meta text-faint">by {details.author}</p>
                    )}
                    <p className="mt-1 text-tiny text-faint">
                      {CATEGORY_LABELS[details.projectType]}
                    </p>
                  </div>
                </div>

                {details.description && (
                  <DialogDescription className="text-body leading-relaxed text-muted-foreground">
                    {details.description}
                  </DialogDescription>
                )}

                <div className="divide-y divide-border rounded-lg border border-border bg-background/50">
                  {details.downloads != null && (
                    <MetaRow
                      label="Downloads"
                      value={
                        <span className="inline-flex items-center gap-1">
                          <Download className="size-3" /> {formatCount(details.downloads)}
                        </span>
                      }
                    />
                  )}
                  {details.gameVersions.length > 0 && (
                    <MetaRow
                      label="Game versions"
                      value={details.gameVersions.slice(0, 6).join(", ")}
                    />
                  )}
                  {details.loaders.length > 0 && (
                    <MetaRow
                      label="Loaders"
                      value={
                        <span className="flex flex-wrap justify-end gap-1">
                          {details.loaders.map((l) => (
                            <span key={l} className="rounded-sm border border-border px-1.5 py-px text-tiny">
                              {l}
                            </span>
                          ))}
                        </span>
                      }
                    />
                  )}
                  {details.license && <MetaRow label="License" value={details.license} />}
                  {details.updatedAt && (
                    <MetaRow label="Updated" value={new Date(details.updatedAt).toLocaleDateString()} />
                  )}
                  {details.publishedAt && (
                    <MetaRow label="Published" value={new Date(details.publishedAt).toLocaleDateString()} />
                  )}
                </div>

                {details.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {details.categories.slice(0, 12).map((c) => (
                      <span
                        key={c}
                        className="rounded-sm border border-border bg-background/50 px-2 py-0.5 text-tiny text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {details.files.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-meta font-semibold text-muted-foreground">Recent files</h3>
                    <div className="space-y-1.5">
                      {details.files.slice(0, 5).map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-meta font-medium">{f.name}</p>
                            <p className="text-tiny text-faint">
                              {f.loaders.join(", ") || "—"} · {f.gameVersions.slice(0, 3).join(", ") || "—"}
                            </p>
                          </div>
                          {f.date && (
                            <span className="shrink-0 text-tiny text-faint">
                              {new Date(f.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {url && (
                    <Button asChild variant="secondary">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink /> Open on {providerLabel}
                      </a>
                    </Button>
                  )}
                  <span className="inline-flex items-center gap-1.5 self-center text-tiny text-faint">
                    Direct installation arrives in a later stage
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

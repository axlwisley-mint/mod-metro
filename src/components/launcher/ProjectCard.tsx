import { Download, ExternalLink, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  PROVIDER_LABELS,
  formatCount,
  safeProviderUrl,
  type ProjectSummary,
} from "@/lib/content/types";

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

function ProjectIcon({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-faint">
        <Package className="size-5" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-elevated">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="size-full object-cover"
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const parent = img.parentElement;
          if (parent) {
            parent.className = "flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-elevated text-faint";
            parent.innerHTML = "";
            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icon.setAttribute("class", "size-5");
            icon.setAttribute("viewBox", "0 0 24 24");
            icon.setAttribute("fill", "none");
            icon.setAttribute("stroke", "currentColor");
            icon.setAttribute("stroke-width", "1.5");
            icon.innerHTML = '<path d="M12 2.5 20.5 7.2v9.6L12 21.5 3.5 16.8V7.2z"/>';
            parent.appendChild(icon);
          }
        }}
      />
    </div>
  );
}

export function ProjectCard({ project, onView }: { project: ProjectSummary; onView: (p: ProjectSummary) => void }) {
  const url = safeProviderUrl(project.pageUrl, project.provider);
  const recentVersions = project.gameVersions.slice(0, 3);

  return (
    <div
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors duration-[180ms] hover:border-faint/50"
    >
      <div className="flex items-start gap-3">
        <ProjectIcon src={project.iconUrl} alt={project.title} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-body font-semibold">{project.title}</h3>
            <ProviderBadge provider={project.provider} />
          </div>
          {project.author && (
            <p className="mt-0.5 truncate text-meta text-faint">by {project.author}</p>
          )}
        </div>
      </div>

      {project.description && (
        <p className="line-clamp-2 min-h-[2.6em] text-meta text-muted-foreground">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-tiny text-faint">
        <span>{CATEGORY_LABELS[project.projectType]}</span>
        {project.downloads != null && (
          <span className="inline-flex items-center gap-1">
            <Download className="size-3" /> {formatCount(project.downloads)}
          </span>
        )}
        {recentVersions.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="size-1 rounded-full bg-faint" />
            {recentVersions.join(", ")}
            {project.gameVersions.length > 3 && "…"}
          </span>
        )}
      </div>

      {project.loaders.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.loaders.slice(0, 4).map((l) => (
            <span key={l} className="rounded-sm border border-border px-1.5 py-px text-tiny text-muted-foreground">
              {l}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Button size="sm" variant="secondary" onClick={() => onView(project)}>
          <Eye /> View details
        </Button>
        {url && (
          <Button size="sm" variant="ghost" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Open
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 animate-pulse rounded-lg bg-primary/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-primary/10" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-primary/10" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-primary/10" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-primary/10" />
      </div>
      <div className="h-3 w-1/2 animate-pulse rounded bg-primary/10" />
      <div className="mt-auto flex gap-2 pt-1">
        <div className="h-8 w-24 animate-pulse rounded-md bg-primary/10" />
      </div>
    </div>
  );
}

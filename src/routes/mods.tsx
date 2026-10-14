import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, Package, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/launcher/primitives";
import { ProjectCard, ProjectCardSkeleton } from "@/components/launcher/ProjectCard";
import { ProjectDetailsDialog } from "@/components/launcher/ProjectDetailsDialog";
import { DiscoverControls } from "@/components/launcher/DiscoverControls";
import { modrinthGameVersions } from "@/lib/content/modrinth";
import {
  providersFor,
  searchProviders,
} from "@/lib/content/search";
import {
  PROVIDER_LABELS,
  type ContentCategory,
  type LoaderFilter,
  type ProjectSummary,
  type ProviderError,
  type ProviderMode,
  type SearchParams,
  type SortKey,
} from "@/lib/content/types";
import { LOADER_CATEGORIES } from "@/lib/content/types";

export const Route = createFileRoute("/mods")({
  head: () => ({
    meta: [
      { title: "Discover — NOVA Launcher" },
      { name: "description", content: "Browse and discover Minecraft mods, modpacks, resource packs, shaders, and more from Modrinth and CurseForge." },
      { property: "og:title", content: "Discover — NOVA Launcher" },
      { property: "og:description", content: "Find your next favorite addition to Minecraft." },
    ],
  }),
  component: ModsDiscover,
});

const DEFAULT_PARAMS: SearchParams = {
  query: "",
  category: "mod",
  sort: "relevance",
  gameVersion: null,
  loader: null,
};

function ModsDiscover() {
  const [params, setParams] = useState<SearchParams>(DEFAULT_PARAMS);
  const [provider, setProvider] = useState<ProviderMode>("modrinth");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errors, setErrors] = useState<ProviderError[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [gameVersions, setGameVersions] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const abortMoreRef = useRef<AbortController | null>(null);

  // Load game versions once
  useEffect(() => {
    modrinthGameVersions()
      .then(setGameVersions)
      .catch(() => {});
  }, []);

  // Debounce the query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(params.query), 300);
    return () => clearTimeout(t);
  }, [params.query]);

  const searchParams: SearchParams = useMemo(
    () => ({ ...params, query: debouncedQuery }),
    [params, debouncedQuery],
  );

  const hasActiveFilters = params.query.trim() !== "" || params.gameVersion !== null || params.loader !== null;

  const clearFilters = useCallback(() => {
    setParams((p) => ({ ...p, query: "", gameVersion: null, loader: null }));
    setDebouncedQuery("");
  }, []);

  // Reset and search when params or provider change
  useEffect(() => {
    abortRef.current?.abort();
    abortMoreRef.current?.abort();

    if (debouncedQuery !== params.query && debouncedQuery !== params.query) return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const providers = providersFor(provider);

    setLoading(true);
    setErrors([]);
    setItems([]);
    setPage(0);
    setHasMore(false);
    setAllLoaded(false);

    searchProviders(providers, searchParams, 0, ctrl.signal)
      .then((result) => {
        if (ctrl.signal.aborted) return;
        setItems(result.items);
        setErrors(result.errors);
        setHasMore(result.more.length > 0);
        setAllLoaded(result.items.length === 0 || result.more.length === 0);
      })
      .catch((e) => {
        if (ctrl.signal.aborted || e?.name === "AbortError") return;
        setErrors([{ provider: "modrinth", kind: "network", message: "Couldn't load projects. Check your connection and try again." }]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [searchParams, provider]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    abortMoreRef.current?.abort();
    const ctrl = new AbortController();
    abortMoreRef.current = ctrl;
    const nextPage = page + 1;
    const providers = providersFor(provider);

    setLoadingMore(true);
    searchProviders(providers, searchParams, nextPage, ctrl.signal)
      .then((result) => {
        if (ctrl.signal.aborted) return;
        // Deduplicate by key
        const existingKeys = new Set(items.map((i) => i.key));
        const fresh = result.items.filter((i) => !existingKeys.has(i.key));
        setItems((prev) => [...prev, ...fresh]);
        setPage(nextPage);
        setHasMore(result.more.length > 0 && fresh.length > 0);
        setAllLoaded(fresh.length === 0);
        // Merge errors (keep existing, append new)
        if (result.errors.length > 0) {
          setErrors((prev) => {
            const seen = new Set(prev.map((e) => e.provider));
            return [...prev, ...result.errors.filter((e) => !seen.has(e.provider))];
          });
        }
      })
      .catch((e) => {
        if (ctrl.signal.aborted || e?.name === "AbortError") return;
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoadingMore(false);
      });
  }, [loadingMore, hasMore, page, provider, searchParams, items]);

  const showLoaderFilter = LOADER_CATEGORIES.includes(params.category);

  const onCategoryChange = (c: ContentCategory) => setParams((p) => ({ ...p, category: c, loader: null }));
  const onSortChange = (s: SortKey) => setParams((p) => ({ ...p, sort: s }));
  const onGameVersionChange = (v: string | null) => setParams((p) => ({ ...p, gameVersion: v }));
  const onLoaderChange = (v: LoaderFilter | null) => setParams((p) => ({ ...p, loader: v }));

  const onView = (p: ProjectSummary) => {
    setSelectedProject(p);
    setDetailsOpen(true);
  };

  const activeProviders = providersFor(provider);
  const allErrored = errors.length > 0 && errors.length >= activeProviders.length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Discover"
        subtitle="Find your next favorite addition to Minecraft."
      />

      <DiscoverControls
        query={params.query}
        onQueryChange={(v) => setParams((p) => ({ ...p, query: v }))}
        provider={provider}
        onProviderChange={setProvider}
        category={params.category}
        onCategoryChange={onCategoryChange}
        sort={params.sort}
        onSortChange={onSortChange}
        gameVersion={params.gameVersion}
        onGameVersionChange={onGameVersionChange}
        loader={params.loader}
        onLoaderChange={onLoaderChange}
        gameVersions={gameVersions}
        showLoaderFilter={showLoaderFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* Partial provider errors (non-fatal) */}
      {errors.length > 0 && !allErrored && !loading && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/20 bg-warning/5 px-4 py-2.5 text-meta text-warning">
          <AlertCircle className="size-3.5 shrink-0" />
          {errors.map((e, i) => (
            <span key={i}>
              {PROVIDER_LABELS[e.provider]}: {e.message}{i < errors.length - 1 ? " · " : ""}
            </span>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* All providers errored */}
      {allErrored && !loading && (
        <Panel>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <AlertCircle className="size-8 text-muted-foreground" />
            <div>
              <p className="text-section font-semibold">Couldn't load projects</p>
              <p className="mt-1 text-body text-muted-foreground">
                Check your connection and try again.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setParams((p) => ({ ...p }));
              }}
            >
              <RefreshCw /> Retry
            </Button>
          </div>
        </Panel>
      )}

      {/* No results */}
      {!loading && !allErrored && items.length === 0 && (
        <Panel>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Package className="size-8 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-section font-semibold">No projects found</p>
              <p className="mt-1 text-body text-muted-foreground">
                Try another search or adjust your filters.
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>
            )}
          </div>
        </Panel>
      )}

      {/* Results grid */}
      {!loading && !allErrored && items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProjectCard key={p.key} project={p} onView={onView} />
            ))}
          </div>

          {hasMore && !allLoaded && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="animate-spin" /> : <Package />}
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}

          {!hasMore && !allLoaded && items.length > 0 && (
            <p className="text-center text-meta text-faint">You've reached the end of the results.</p>
          )}
        </>
      )}

      <ProjectDetailsDialog
        project={selectedProject}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}

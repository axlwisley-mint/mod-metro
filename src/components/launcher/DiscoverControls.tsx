import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  PROVIDER_LABELS,
  type ContentCategory,
  type LoaderFilter,
  type ProviderMode,
  type SortKey,
} from "@/lib/content/types";
import {
  inputClass,
  selectContentClass,
  selectItemClass,
  selectTriggerClass,
} from "./primitives";

const CATEGORY_ORDER: ContentCategory[] = ["mod", "modpack", "resourcepack", "shader", "datapack", "plugin"];
const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Relevance",
  downloads: "Downloads",
  updated: "Recently updated",
};
const LOADER_OPTIONS: { value: LoaderFilter; label: string }[] = [
  { value: "fabric", label: "Fabric" },
  { value: "forge", label: "Forge" },
  { value: "neoforge", label: "NeoForge" },
  { value: "quilt", label: "Quilt" },
];

interface DiscoverControlsProps {
  query: string;
  onQueryChange: (v: string) => void;
  provider: ProviderMode;
  onProviderChange: (v: ProviderMode) => void;
  category: ContentCategory;
  onCategoryChange: (v: ContentCategory) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  gameVersion: string | null;
  onGameVersionChange: (v: string | null) => void;
  loader: LoaderFilter | null;
  onLoaderChange: (v: LoaderFilter | null) => void;
  gameVersions: string[];
  showLoaderFilter: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function DiscoverControls({
  query,
  onQueryChange,
  provider,
  onProviderChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  gameVersion,
  onGameVersionChange,
  loader,
  onLoaderChange,
  gameVersions,
  showLoaderFilter,
  hasActiveFilters,
  onClearFilters,
}: DiscoverControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search + provider + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <Input
            aria-label="Search projects"
            placeholder="Search mods, resource packs, shaders..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        <Select value={provider} onValueChange={(v) => onProviderChange(v as ProviderMode)}>
          <SelectTrigger aria-label="Provider" className={`${selectTriggerClass} w-36`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectItem value="modrinth" className={selectItemClass}>{PROVIDER_LABELS.modrinth}</SelectItem>
            <SelectItem value="curseforge" className={selectItemClass}>{PROVIDER_LABELS.curseforge}</SelectItem>
            <SelectItem value="both" className={selectItemClass}>Both</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
          <SelectTrigger aria-label="Sort by" className={`${selectTriggerClass} w-40`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <SelectItem key={k} value={k} className={selectItemClass}>{SORT_LABELS[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category bar — horizontally scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            aria-current={category === cat ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 text-meta font-medium transition-colors duration-[170ms]",
              category === cat
                ? "border-primary/30 bg-accent-surface text-primary"
                : "border-border bg-surface text-muted-foreground hover:border-faint/50 hover:text-foreground",
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Version + loader filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={gameVersion ?? "all"}
          onValueChange={(v) => onGameVersionChange(v === "all" ? null : v)}
        >
          <SelectTrigger aria-label="Minecraft version" className={`${selectTriggerClass} w-44`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectItem value="all" className={selectItemClass}>All versions</SelectItem>
            {gameVersions.map((v) => (
              <SelectItem key={v} value={v} className={selectItemClass}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showLoaderFilter && (
          <Select
            value={loader ?? "all"}
            onValueChange={(v) => onLoaderChange(v === "all" ? null : v as LoaderFilter)}
          >
            <SelectTrigger aria-label="Mod loader" className={`${selectTriggerClass} w-36`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="all" className={selectItemClass}>All loaders</SelectItem>
              {LOADER_OPTIONS.map((l) => (
                <SelectItem key={l.value} value={l.value} className={selectItemClass}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-meta text-faint transition-colors duration-150 hover:text-foreground"
          >
            <X className="size-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

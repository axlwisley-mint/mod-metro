/** Normalized discovery models. Provider response shapes stay inside each provider module. */
export type Provider = "modrinth" | "curseforge";
export type ProviderMode = Provider | "both";
export type ContentCategory = "mod" | "modpack" | "resourcepack" | "shader" | "datapack" | "plugin";
export type SortKey = "relevance" | "downloads" | "updated";
export type LoaderFilter = "fabric" | "forge" | "neoforge" | "quilt";

export interface SearchParams {
  query: string;
  category: ContentCategory;
  sort: SortKey;
  gameVersion: string | null;
  loader: LoaderFilter | null;
}

export interface ProjectSummary {
  key: string; // provider:id — unique within the merged list
  provider: Provider;
  id: string;
  slug: string;
  title: string;
  author?: string;
  description?: string;
  iconUrl?: string;
  downloads?: number;
  gameVersions: string[];
  loaders: string[];
  categories: string[];
  projectType: ContentCategory;
  updatedAt?: string;
  pageUrl?: string;
}

export interface ProviderPage {
  provider: Provider;
  items: ProjectSummary[];
  total?: number;
  hasMore: boolean;
}

export type ProviderError = { provider: Provider; kind: "not_configured" | "rate_limited" | "network" | "error"; message: string };

export interface ProjectFile {
  name: string;
  versionNumber?: string;
  gameVersions: string[];
  loaders: string[];
  date?: string;
  fileName?: string;
  size?: number;
}

export interface ProjectDetails extends ProjectSummary {
  license?: string;
  publishedAt?: string;
  files: ProjectFile[];
}

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  mod: "Mods",
  modpack: "Modpacks",
  resourcepack: "Resource Packs",
  shader: "Shaders",
  datapack: "Data Packs",
  plugin: "Plugins",
};

/** Categories where mod-loader filters are meaningful. */
export const LOADER_CATEGORIES: ContentCategory[] = ["mod", "modpack"];

export const PROVIDER_LABELS: Record<Provider, string> = { modrinth: "Modrinth", curseforge: "CurseForge" };

export class ProviderRequestError extends Error {
  constructor(public kind: ProviderError["kind"], message: string) {
    super(message);
  }
}

/** Only allow HTTPS links to the provider's own domain. */
export function safeProviderUrl(url: string | undefined, provider: Provider): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const host = provider === "modrinth" ? "modrinth.com" : "curseforge.com";
    if (u.protocol !== "https:") return undefined;
    if (u.hostname !== host && !u.hostname.endsWith("." + host)) return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

export function formatCount(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

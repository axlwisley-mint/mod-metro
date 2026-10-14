/** Modrinth public API (v2) — read-only, no auth required. https://docs.modrinth.com/api/ */
import {
  ProviderRequestError,
  safeProviderUrl,
  type ContentCategory,
  type ProjectDetails,
  type ProviderPage,
  type SearchParams,
} from "./types";

const BASE = "https://api.modrinth.com/v2";
export const PAGE_SIZE = 24;

const LOADER_NAMES = new Set(["fabric", "forge", "neoforge", "quilt", "liteloader", "rift", "babric", "bukkit", "paper", "spigot", "purpur", "folia", "velocity", "bungeecord", "waterfall", "sponge", "datapack", "iris", "optifine", "canvas", "vanilla", "minecraft"]);

interface MrHit {
  project_id: string; slug: string; title: string; author?: string; description?: string;
  icon_url?: string | null; downloads?: number; versions?: string[]; categories?: string[];
  display_categories?: string[]; date_modified?: string; license?: string;
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, { signal, headers: { Accept: "application/json" } });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ProviderRequestError("network", "Couldn't reach Modrinth.");
  }
  if (res.status === 429) throw new ProviderRequestError("rate_limited", "Modrinth is rate-limiting requests. Wait a moment, then retry.");
  if (!res.ok) throw new ProviderRequestError("error", `Modrinth responded with ${res.status}.`);
  return res.json() as Promise<T>;
}

const splitCats = (cats: string[] = []) => ({
  loaders: cats.filter((c) => LOADER_NAMES.has(c)),
  categories: cats.filter((c) => !LOADER_NAMES.has(c)),
});

const pageUrl = (type: ContentCategory, slug: string) => safeProviderUrl(`https://modrinth.com/${type}/${encodeURIComponent(slug)}`, "modrinth");

/** Show newest-first, release-looking versions. Modrinth returns oldest-first. */
const sortVersions = (v: string[] = []) => [...v].reverse();

export async function searchModrinth(p: SearchParams, page: number, signal?: AbortSignal): Promise<ProviderPage> {
  const facets: string[][] = [[`project_type:${p.category}`]];
  if (p.loader) facets.push([`categories:${p.loader}`]);
  if (p.gameVersion) facets.push([`versions:${p.gameVersion}`]);
  const qs = new URLSearchParams({
    facets: JSON.stringify(facets),
    index: p.sort === "updated" ? "updated" : p.sort,
    offset: String(page * PAGE_SIZE),
    limit: String(PAGE_SIZE),
  });
  if (p.query.trim()) qs.set("query", p.query.trim());
  const data = await get<{ hits: MrHit[]; total_hits: number; offset: number }>(`/search?${qs}`, signal);
  return {
    provider: "modrinth",
    total: data.total_hits,
    hasMore: (page + 1) * PAGE_SIZE < data.total_hits,
    items: data.hits.map((h) => {
      const { loaders, categories } = splitCats(h.categories);
      return {
        key: `modrinth:${h.project_id}`,
        provider: "modrinth" as const,
        id: h.project_id,
        slug: h.slug,
        title: h.title,
        author: h.author || undefined,
        description: h.description || undefined,
        iconUrl: h.icon_url || undefined,
        downloads: h.downloads,
        gameVersions: sortVersions(h.versions),
        loaders,
        categories: splitCats(h.display_categories ?? h.categories).categories.length ? splitCats(h.display_categories).categories : categories,
        projectType: p.category,
        updatedAt: h.date_modified,
        pageUrl: pageUrl(p.category, h.slug),
      };
    }),
  };
}

interface MrProject {
  id: string; slug: string; title: string; description?: string; icon_url?: string | null; downloads?: number;
  game_versions?: string[]; loaders?: string[]; categories?: string[]; additional_categories?: string[];
  updated?: string; published?: string; license?: { id: string; name?: string } | null;
}
interface MrVersion {
  name: string; version_number: string; game_versions: string[]; loaders: string[]; date_published: string;
  files: { filename: string; size: number; primary: boolean }[];
}
interface MrMember { role: string; user: { username: string } }

export async function modrinthDetails(id: string, type: ContentCategory, signal?: AbortSignal): Promise<ProjectDetails> {
  const [proj, versions, members] = await Promise.all([
    get<MrProject>(`/project/${encodeURIComponent(id)}`, signal),
    get<MrVersion[]>(`/project/${encodeURIComponent(id)}/version`, signal),
    get<MrMember[]>(`/project/${encodeURIComponent(id)}/members`, signal).catch(() => [] as MrMember[]),
  ]);
  const owner = members.find((m) => m.role === "Owner") ?? members[0];
  return {
    key: `modrinth:${proj.id}`,
    provider: "modrinth",
    id: proj.id,
    slug: proj.slug,
    title: proj.title,
    author: owner?.user.username,
    description: proj.description || undefined,
    iconUrl: proj.icon_url || undefined,
    downloads: proj.downloads,
    gameVersions: sortVersions(proj.game_versions),
    loaders: proj.loaders ?? [],
    categories: [...(proj.categories ?? []), ...(proj.additional_categories ?? [])],
    projectType: type,
    updatedAt: proj.updated,
    publishedAt: proj.published,
    license: proj.license ? proj.license.name || proj.license.id : undefined,
    pageUrl: pageUrl(type, proj.slug),
    files: versions.slice(0, 15).map((v) => {
      const f = v.files.find((x) => x.primary) ?? v.files[0];
      return {
        name: v.name,
        versionNumber: v.version_number,
        gameVersions: v.game_versions,
        loaders: v.loaders,
        date: v.date_published,
        fileName: f?.filename,
        size: f?.size,
      };
    }),
  };
}

/** Real release versions from Modrinth's tag endpoint, newest first. */
export async function modrinthGameVersions(): Promise<string[]> {
  const data = await get<{ version: string; version_type: string; major: boolean }[]>("/tag/game_version");
  return data.filter((v) => v.version_type === "release").map((v) => v.version);
}

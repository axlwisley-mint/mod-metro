/**
 * CurseForge Core API proxy. The API key lives only in the server secret
 * CURSEFORGE_API_KEY and is never returned to the browser.
 * Docs: https://docs.curseforge.com/rest-api/
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.curseforge.com/v1";
const MINECRAFT_GAME_ID = 432;
export const CF_PAGE_SIZE = 24;

// CurseForge "classId" values for Minecraft content types
const CLASS_IDS: Record<string, number> = { mod: 6, modpack: 4471, resourcepack: 12, shader: 6552, datapack: 6945, plugin: 5 };
// ModLoaderType enum
const LOADER_TYPES: Record<string, number> = { forge: 1, fabric: 4, quilt: 5, neoforge: 6 };
const LOADER_NAMES: Record<number, string> = { 1: "forge", 2: "cauldron", 3: "liteloader", 4: "fabric", 5: "quilt", 6: "neoforge" };
// ModsSearchSortField enum: 2 Popularity, 3 LastUpdated, 6 TotalDownloads
const SORT_FIELDS: Record<string, number | undefined> = { relevance: undefined, downloads: 6, updated: 3 };

type Result<T> = { ok: true; data: T } | { ok: false; kind: "not_configured" | "rate_limited" | "network" | "error"; message: string };

interface CfMod {
  id: number; name: string; slug: string; summary?: string; downloadCount?: number; classId?: number;
  logo?: { thumbnailUrl?: string; url?: string } | null; authors?: { name: string }[];
  links?: { websiteUrl?: string }; latestFilesIndexes?: { gameVersion: string; modLoader?: number | null }[];
  categories?: { name: string }[]; dateModified?: string; dateReleased?: string; dateCreated?: string;
}
interface CfFile {
  displayName: string; fileName: string; fileDate: string; fileLength: number; gameVersions: string[];
}

async function cf<T>(path: string): Promise<Result<T>> {
  const key = process.env["CURSEFORGE_API_KEY"];
  if (!key) return { ok: false, kind: "not_configured", message: "CurseForge isn't configured. An approved API key is required." };
  let res: Response;
  try {
    res = await fetch(BASE + path, { headers: { "x-api-key": key, Accept: "application/json" } });
  } catch {
    return { ok: false, kind: "network", message: "Couldn't reach CurseForge." };
  }
  if (res.status === 429) return { ok: false, kind: "rate_limited", message: "CurseForge is rate-limiting requests. Wait a moment, then retry." };
  if (res.status === 401 || res.status === 403) return { ok: false, kind: "not_configured", message: "The CurseForge API key was rejected." };
  if (!res.ok) return { ok: false, kind: "error", message: `CurseForge responded with ${res.status}.` };
  return { ok: true, data: (await res.json()) as T };
}

function normalize(m: CfMod, category: string) {
  const versions = new Set<string>();
  const loaders = new Set<string>();
  for (const f of m.latestFilesIndexes ?? []) {
    versions.add(f.gameVersion);
    if (f.modLoader && LOADER_NAMES[f.modLoader]) loaders.add(LOADER_NAMES[f.modLoader]!);
  }
  return {
    key: `curseforge:${m.id}`,
    provider: "curseforge" as const,
    id: String(m.id),
    slug: m.slug,
    title: m.name,
    author: m.authors?.[0]?.name,
    description: m.summary || undefined,
    iconUrl: m.logo?.thumbnailUrl || m.logo?.url || undefined,
    downloads: m.downloadCount,
    gameVersions: [...versions],
    loaders: [...loaders],
    categories: (m.categories ?? []).map((c) => c.name),
    projectType: category,
    updatedAt: m.dateModified,
    pageUrl: m.links?.websiteUrl,
  };
}

const searchInput = z.object({
  query: z.string().max(200),
  category: z.enum(["mod", "modpack", "resourcepack", "shader", "datapack", "plugin"]),
  sort: z.enum(["relevance", "downloads", "updated"]),
  gameVersion: z.string().max(40).nullable(),
  loader: z.enum(["fabric", "forge", "neoforge", "quilt"]).nullable(),
  page: z.number().int().min(0).max(400),
});

export const searchCurseForge = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => searchInput.parse(d))
  .handler(async ({ data }) => {
    const qs = new URLSearchParams({
      gameId: String(MINECRAFT_GAME_ID),
      classId: String(CLASS_IDS[data.category]),
      index: String(data.page * CF_PAGE_SIZE),
      pageSize: String(CF_PAGE_SIZE),
      sortOrder: "desc",
    });
    if (data.query.trim()) qs.set("searchFilter", data.query.trim());
    const sf = SORT_FIELDS[data.sort];
    if (sf) qs.set("sortField", String(sf));
    if (data.gameVersion) qs.set("gameVersion", data.gameVersion);
    if (data.loader) qs.set("modLoaderType", String(LOADER_TYPES[data.loader]));
    const r = await cf<{ data: CfMod[]; pagination: { index: number; resultCount: number; totalCount: number } }>(`/mods/search?${qs}`);
    if (!r.ok) return r;
    const { pagination } = r.data;
    // CurseForge caps index + pageSize at 10,000
    const end = pagination.index + pagination.resultCount;
    return {
      ok: true as const,
      data: {
        items: r.data.data.map((m) => normalize(m, data.category)),
        total: pagination.totalCount,
        hasMore: end < pagination.totalCount && end + CF_PAGE_SIZE <= 10000 && pagination.resultCount > 0,
      },
    };
  });

export const curseForgeDetails = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().regex(/^\d+$/), category: searchInput.shape.category }).parse(d))
  .handler(async ({ data }) => {
    const [mod, files] = await Promise.all([
      cf<{ data: CfMod }>(`/mods/${data.id}`),
      cf<{ data: CfFile[] }>(`/mods/${data.id}/files?pageSize=15`),
    ]);
    if (!mod.ok) return mod;
    const loaderSet = new Set(Object.keys(LOADER_TYPES).concat(["cauldron", "liteloader"]));
    return {
      ok: true as const,
      data: {
        ...normalize(mod.data.data, data.category),
        publishedAt: mod.data.data.dateReleased || mod.data.data.dateCreated,
        files: files.ok
          ? files.data.data.map((f) => ({
              name: f.displayName,
              gameVersions: f.gameVersions.filter((v) => /^\d/.test(v)),
              loaders: f.gameVersions.map((v) => v.toLowerCase()).filter((v) => loaderSet.has(v)),
              date: f.fileDate,
              fileName: f.fileName,
              size: f.fileLength,
            }))
          : [],
      },
    };
  });

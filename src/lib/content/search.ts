/** Provider-agnostic search orchestration used by the Discover screen. */
import { curseForgeDetails, searchCurseForge } from "./curseforge.functions";
import { modrinthDetails, searchModrinth } from "./modrinth";
import {
  ProviderRequestError,
  safeProviderUrl,
  type ContentCategory,
  type Provider,
  type ProjectDetails,
  type ProjectSummary,
  type ProviderError,
  type ProviderMode,
  type SearchParams,
} from "./types";

/** Which content types each provider supports. */
export const PROVIDER_CATEGORIES: Record<Provider, ContentCategory[]> = {
  modrinth: ["mod", "modpack", "resourcepack", "shader", "datapack", "plugin"],
  curseforge: ["mod", "modpack", "resourcepack", "shader", "datapack", "plugin"],
};

export interface MergedPage {
  items: ProjectSummary[];
  totals: Partial<Record<Provider, number>>;
  errors: ProviderError[];
  /** Providers that still have further pages. */
  more: Provider[];
}

async function searchOne(provider: Provider, p: SearchParams, page: number, signal?: AbortSignal) {
  if (provider === "modrinth") return searchModrinth(p, page, signal);
  const r = await searchCurseForge({ data: { ...p, page } });
  if (!r.ok) throw new ProviderRequestError(r.kind, r.message);
  return {
    provider: "curseforge" as const,
    total: r.data.total,
    hasMore: r.data.hasMore,
    items: r.data.items.map((i) => ({ ...i, projectType: p.category, pageUrl: safeProviderUrl(i.pageUrl, "curseforge") })),
  };
}

export async function searchProviders(providers: Provider[], p: SearchParams, page: number, signal?: AbortSignal): Promise<MergedPage> {
  const settled = await Promise.allSettled(providers.map((pr) => searchOne(pr, p, page, signal)));
  const out: MergedPage = { items: [], totals: {}, errors: [], more: [] };
  const lists: ProjectSummary[][] = [];
  settled.forEach((s, i) => {
    const pr = providers[i]!;
    if (s.status === "fulfilled") {
      lists.push(s.value.items);
      out.totals[pr] = s.value.total;
      if (s.value.hasMore) out.more.push(pr);
    } else {
      const e = s.reason;
      if (e?.name === "AbortError") throw e;
      out.errors.push({
        provider: pr,
        kind: e instanceof ProviderRequestError ? e.kind : "network",
        message: e instanceof Error ? e.message : "Request failed.",
      });
    }
  });
  // Interleave so "Both" mode doesn't bury one provider below the other
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.items.push(l[i]!);
  if (out.errors.length === providers.length && providers.length) {
    throw Object.assign(new Error(out.errors.map((e) => e.message).join(" ")), { errors: out.errors });
  }
  return out;
}

export const providersFor = (mode: ProviderMode): Provider[] => (mode === "both" ? ["modrinth", "curseforge"] : [mode]);

export async function fetchDetails(item: ProjectSummary, signal?: AbortSignal): Promise<ProjectDetails> {
  if (item.provider === "modrinth") return modrinthDetails(item.id, item.projectType, signal);
  const r = await curseForgeDetails({ data: { id: item.id, category: item.projectType } });
  if (!r.ok) throw new ProviderRequestError(r.kind, r.message);
  return { ...r.data, projectType: item.projectType, pageUrl: safeProviderUrl(r.data.pageUrl, "curseforge") };
}

import type { ModLoader, VersionOption } from "./types";

/** Demonstration versions until real version-manifest fetching is implemented. */
export const DEMO_VERSIONS: VersionOption[] = [
  { id: "1.21.x", label: "1.21.x — Release", channel: "release", demo: true },
  { id: "1.20.4", label: "1.20.4 — Release", channel: "release", demo: true },
  { id: "snapshot", label: "Latest Snapshot", channel: "snapshot", demo: true },
];

export const MOD_LOADERS: { id: ModLoader; label: string; hint: string }[] = [
  { id: "vanilla", label: "Vanilla", hint: "The unmodified game, as Mojang ships it." },
  { id: "fabric", label: "Fabric", hint: "Lightweight loader for performance and utility mods. Not yet set up." },
  { id: "forge", label: "Forge", hint: "Classic loader for large content mods. Not yet set up." },
];

export const versionLabel = (id: string | null) =>
  DEMO_VERSIONS.find((v) => v.id === id)?.label ?? "No version selected";

export const RAM_MIN = 2;
export const RAM_MAX = 16;

export type ModLoader = "vanilla" | "fabric" | "forge";

export interface VersionOption {
  id: string;
  label: string;
  channel: "release" | "snapshot";
  /** True for hardcoded demo entries; false once fetched from the real version manifest. */
  demo: boolean;
}

export interface Installation {
  id: string;
  name: string;
  versionId: string;
  modLoader: ModLoader;
  createdAt: number;
  /** Prototype entries are profiles only — no game files exist for them. */
  prototype: true;
}

export interface Preferences {
  reduceMotion: boolean;
  theme: "dark";
  startup: "home" | "last";
  selectedVersion: string | null;
  defaultVersion: string | null;
  ramGb: number;
  modLoader: ModLoader;
  concurrency: number;
}

export type LaunchState = "install" | "downloading" | "play" | "launching" | "running";

export interface ProgressTask {
  label: string;
  percent: number;
  message?: string;
  transfer?: string;
}

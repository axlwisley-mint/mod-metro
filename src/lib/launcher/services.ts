/**
 * Future launcher service boundary.
 *
 * The UI talks only to these interfaces. Real implementations will live behind a
 * desktop bridge (e.g. a preload-exposed API) — never in browser code. Until then
 * every call rejects with NotImplementedError so nothing pretends to work.
 */
import type { Installation, ModLoader, ProgressTask, VersionOption } from "./types";

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} isn't connected yet. It will be added in a later stage.`);
    this.name = "NotImplementedError";
  }
}

export interface AuthService {
  signInWithMicrosoft(): Promise<{ username: string }>;
  signOut(): Promise<void>;
}
export interface VersionService {
  listVersions(): Promise<VersionOption[]>;
}
export interface InstallService {
  install(versionId: string, loader: ModLoader, onProgress: (t: ProgressTask) => void): Promise<Installation>;
}
export interface GameService {
  launch(installationId: string, ramGb: number): Promise<void>;
  stop(): Promise<void>;
}

export interface LauncherServices {
  auth: AuthService;
  versions: VersionService;
  install: InstallService;
  game: GameService;
}

const reject = (f: string) => () => Promise.reject(new NotImplementedError(f));

export const services: LauncherServices = {
  auth: { signInWithMicrosoft: reject("Microsoft sign-in"), signOut: reject("Sign-out") },
  versions: { listVersions: reject("Version manifest") },
  install: { install: reject("Game installation") },
  game: { launch: reject("Game launching"), stop: reject("Stopping the game") },
};

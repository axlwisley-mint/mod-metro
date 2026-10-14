import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Installation, Preferences } from "./types";
import { load, loadList, save } from "./storage";

const DEFAULT_PREFS: Preferences = {
  reduceMotion: false,
  theme: "dark",
  startup: "home",
  selectedVersion: null,
  defaultVersion: null,
  ramGb: 4,
  modLoader: "vanilla",
  concurrency: 4,
};

interface LauncherCtx {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  installations: Installation[];
  addInstallation: (i: Omit<Installation, "id" | "createdAt" | "prototype">) => void;
  removeInstallation: (id: string) => void;
  signInOpen: boolean;
  setSignInOpen: (open: boolean) => void;
  /** Always false until real Microsoft auth exists. */
  signedIn: false;
}

const Ctx = createContext<LauncherCtx | null>(null);

export function LauncherProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [signInOpen, setSignInOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(load("prefs", DEFAULT_PREFS));
    setInstallations(loadList<Installation>("installations"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    save("prefs", prefs);
    document.documentElement.dataset["reduceMotion"] = String(prefs.reduceMotion);
  }, [prefs, hydrated]);

  useEffect(() => {
    if (hydrated) save("installations", installations);
  }, [installations, hydrated]);

  const setPref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  }, []);

  const addInstallation = useCallback((i: Omit<Installation, "id" | "createdAt" | "prototype">) => {
    setInstallations((list) => [
      { ...i, id: crypto.randomUUID(), createdAt: Date.now(), prototype: true },
      ...list,
    ]);
  }, []);

  const removeInstallation = useCallback((id: string) => {
    setInstallations((list) => list.filter((i) => i.id !== id));
  }, []);

  const value = useMemo<LauncherCtx>(
    () => ({ prefs, setPref, installations, addInstallation, removeInstallation, signInOpen, setSignInOpen, signedIn: false }),
    [prefs, setPref, installations, addInstallation, removeInstallation, signInOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLauncher() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLauncher must be used within LauncherProvider");
  return c;
}

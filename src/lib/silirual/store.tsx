import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultReminders, members } from "./demo-data";
import { speechLocale, translate } from "./i18n";
import type { GameId, LangCode, Reminder, Role, Settings } from "./types";

const STORAGE_KEY = "silirual.state.v1";

interface PersistedState {
  role: Role | null;
  settings: Settings;
  reminders: Reminder[];
  bestLevels: Record<GameId, number>;
  memoryResponses: Record<string, "remember" | "unsure" | "no">;
  onboarded: boolean;
}

const defaultSettings: Settings = {
  language: "en",
  textSize: "large",
  voice: true,
  voiceSpeed: "normal",
  haptics: true,
  reducedMotion: false,
  comfortableSpeed: true,
};

const initialState: PersistedState = {
  role: null,
  settings: defaultSettings,
  reminders: defaultReminders,
  bestLevels: { pattern: 3, find: 2, match: 3, signals: 3 },
  memoryResponses: {},
  onboarded: false,
};

interface StoreValue extends PersistedState {
  member: (typeof members)[number];
  t: (key: string) => string;
  setRole: (role: Role | null) => void;
  setLanguage: (lang: LangCode) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  toggleReminder: (id: string) => void;
  snoozeReminder: (id: string) => void;
  recordBest: (gameId: GameId, level: number) => void;
  answerMemory: (id: string, answer: "remember" | "unsure" | "no") => void;
  finishOnboarding: () => void;
  speak: (text: string) => void;
  buzz: (pattern?: number | number[]) => void;
  online: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function SilirualProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          settings: { ...prev.settings, ...parsed.settings },
          reminders: parsed.reminders?.length ? parsed.reminders : prev.reminders,
          bestLevels: { ...prev.bestLevels, ...parsed.bestLevels },
        }));
      }
    } catch {
      /* start fresh */
    }
    setHydrated(true);
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
    const root = document.documentElement;
    root.dataset["textSize"] = state.settings.textSize;
    root.dataset["reducedMotion"] = String(state.settings.reducedMotion);
    root.lang = state.settings.language;
  }, [state, hydrated]);

  const t = useCallback(
    (key: string) => translate(state.settings.language, key),
    [state.settings.language],
  );

  const speak = useCallback(
    (text: string) => {
      if (!state.settings.voice || typeof window === "undefined") return;
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = speechLocale(state.settings.language);
      utter.rate = state.settings.voiceSpeed === "slow" ? 0.72 : 0.92;
      synth.speak(utter);
    },
    [state.settings.voice, state.settings.voiceSpeed, state.settings.language],
  );

  const buzz = useCallback(
    (pattern: number | number[] = 18) => {
      if (!state.settings.haptics || typeof navigator === "undefined") return;
      navigator.vibrate?.(pattern);
    },
    [state.settings.haptics],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      member: members[0]!,
      t,
      online,
      speak,
      buzz,
      setRole: (role) => setState((s) => ({ ...s, role })),
      setLanguage: (language) =>
        setState((s) => ({ ...s, settings: { ...s.settings, language } })),
      updateSettings: (patch) =>
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      toggleReminder: (id) =>
        setState((s) => ({
          ...s,
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
        })),
      snoozeReminder: (id) =>
        setState((s) => ({
          ...s,
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, time: r.time } : r)),
        })),
      recordBest: (gameId, level) =>
        setState((s) => ({
          ...s,
          bestLevels: { ...s.bestLevels, [gameId]: Math.max(s.bestLevels[gameId] ?? 1, level) },
        })),
      answerMemory: (id, answer) =>
        setState((s) => ({ ...s, memoryResponses: { ...s.memoryResponses, [id]: answer } })),
      finishOnboarding: () => setState((s) => ({ ...s, onboarded: true })),
    }),
    [state, t, speak, buzz, online],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSilirual() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useSilirual must be used inside SilirualProvider");
  return ctx;
}

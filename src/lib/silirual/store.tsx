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
import type { GameId, GameSession, LangCode, Reminder, Role, Settings } from "./types";

const STORAGE_KEY = "silirual.state.v1";

interface PersistedState {
  role: Role | null;
  activeMemberId: string;
  settings: Settings;
  reminders: Reminder[];
  bestLevels: Record<GameId, number>;
  memoryResponses: Record<string, "remember" | "unsure" | "no">;
  gameSessions: GameSession[];
  hydrationCount: number;
  hydrationGoal: number;
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
  activeMemberId: "m1",
  settings: defaultSettings,
  reminders: defaultReminders,
  bestLevels: { pattern: 3, find: 2, match: 3, signals: 3 },
  memoryResponses: {},
  gameSessions: [],
  hydrationCount: 3,
  hydrationGoal: 5,
  onboarded: false,
};

interface StoreValue extends PersistedState {
  member: (typeof members)[number];
  t: (key: string, params?: Record<string, string | number>) => string;
  setRole: (role: Role | null) => void;
  setActiveMember: (id: string) => void;
  setLanguage: (lang: LangCode) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  toggleReminder: (id: string) => void;
  snoozeReminder: (id: string) => void;
  recordBest: (gameId: GameId, level: number) => void;
  recordGameSession: (session: GameSession) => void;
  answerMemory: (id: string, answer: "remember" | "unsure" | "no") => void;
  incrementHydration: () => void;
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
          gameSessions: parsed.gameSessions ?? prev.gameSessions,
          hydrationCount: parsed.hydrationCount ?? prev.hydrationCount,
          hydrationGoal: parsed.hydrationGoal ?? prev.hydrationGoal,
          activeMemberId: parsed.activeMemberId ?? prev.activeMemberId,
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
    (key: string, params?: Record<string, string | number>) => {
      let text = translate(state.settings.language, key);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return text;
    },
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
      member: members.find((m) => m.id === state.activeMemberId) ?? members[0]!,
      t,
      online,
      speak,
      buzz,
      setRole: (role) => setState((s) => ({ ...s, role })),
      setActiveMember: (id) => setState((s) => ({ ...s, activeMemberId: id })),
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
          reminders: s.reminders.map((r) => {
            if (r.id !== id) return r;
            // Parse time and add 30 minutes
            const parts = r.time.match(/^(\d{1,2}):(\d{2})$/);
            if (!parts) return { ...r, done: true }; // non-standard time, just mark done
            let hours = parseInt(parts[1]!, 10);
            let mins = parseInt(parts[2]!, 10) + 30;
            if (mins >= 60) {
              hours += 1;
              mins -= 60;
            }
            if (hours >= 24) hours = 0;
            const newTime = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
            return { ...r, time: newTime };
          }),
        })),
      recordBest: (gameId, level) =>
        setState((s) => ({
          ...s,
          bestLevels: { ...s.bestLevels, [gameId]: Math.max(s.bestLevels[gameId] ?? 1, level) },
        })),
      recordGameSession: (session) =>
        setState((s) => ({
          ...s,
          gameSessions: [...s.gameSessions, session],
        })),
      answerMemory: (id, answer) =>
        setState((s) => ({ ...s, memoryResponses: { ...s.memoryResponses, [id]: answer } })),
      incrementHydration: () =>
        setState((s) => ({
          ...s,
          hydrationCount: Math.min(s.hydrationCount + 1, s.hydrationGoal),
        })),
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

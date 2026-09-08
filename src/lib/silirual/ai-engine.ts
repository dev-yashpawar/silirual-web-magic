import { gameSessions as seedSessions, memories } from "./demo-data";
import type { GameId, GameSession, Memory } from "./types";

/**
 * Simulated AI personalization engine for CiliRual.
 * AI-generated activity insight — not a medical diagnosis.
 */

/** Determine next difficulty based on recent performance. */
export function nextDifficulty(
  sessions: GameSession[],
  gameId: GameId,
  currentLevel: number,
): number {
  const recent = sessions
    .filter((s) => s.gameId === gameId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  if (recent.length < 2) return currentLevel;

  const avgAccuracy = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
  const avgResponse = recent.reduce((sum, s) => sum + s.responseMs, 0) / recent.length;

  // If consistently strong (>= 85% accuracy and fast), step up
  if (avgAccuracy >= 85 && avgResponse < 3000) {
    return currentLevel + 1;
  }
  // If struggling (< 55% accuracy or very slow), step down
  if (avgAccuracy < 55 || avgResponse > 5000) {
    return Math.max(1, currentLevel - 1);
  }
  // Otherwise maintain
  return currentLevel;
}

export interface Insight {
  label: string;
  value: "High" | "Strong" | "Moderate" | "Gentle";
}

/** Synthesize engagement metrics from game session data. */
export function insightsFor(memberId: string, liveSessions: GameSession[] = []): Insight[] {
  const all = [...seedSessions, ...liveSessions].filter((s) => s.memberId === memberId);
  const avg = all.length > 0
    ? all.reduce((sum, s) => sum + s.accuracy, 0) / all.length
    : 50;

  const level = (v: number): Insight["value"] =>
    v >= 85 ? "High" : v >= 70 ? "Strong" : v >= 50 ? "Moderate" : "Gentle";

  return [
    { label: "Memory recognition", value: level(avg + 5) },
    { label: "Visual recognition", value: level(avg + 8) },
    { label: "Attention", value: level(avg) },
    { label: "Routine recall", value: level(avg - 5) },
    { label: "Nostalgia engagement", value: level(avg + 10) },
  ];
}

const GAME_NAMES: Record<GameId, string> = {
  match: "Memory Match",
  pattern: "Remember the Pattern",
  find: "Three Cups",
  signals: "Memory Signals",
};

const THEMES = ["Family", "Music", "Hometown", "Festivals", "Nature"];

/** Recommend a game and theme based on engagement patterns. */
export function recommendation(memberId: string, liveSessions: GameSession[] = []) {
  const all = [...seedSessions, ...liveSessions].filter((s) => s.memberId === memberId);

  // Find the game with highest average accuracy (most engaging)
  const gameScores: Partial<Record<GameId, { total: number; count: number }>> = {};
  for (const s of all) {
    const entry = gameScores[s.gameId] ?? { total: 0, count: 0 };
    entry.total += s.accuracy;
    entry.count += 1;
    gameScores[s.gameId] = entry;
  }

  // Find least-played game for variety, or most successful for engagement
  const gameIds: GameId[] = ["match", "pattern", "find", "signals"];
  let bestGame: GameId = "match";
  let minPlays = Infinity;

  for (const gid of gameIds) {
    const entry = gameScores[gid];
    if (!entry || entry.count < minPlays) {
      minPlays = entry?.count ?? 0;
      bestGame = gid;
    }
  }

  // If the user has strong engagement with one game, sometimes recommend it
  if (all.length > 4) {
    let highestAvg = 0;
    for (const gid of gameIds) {
      const entry = gameScores[gid];
      if (entry && entry.count >= 2) {
        const avg = entry.total / entry.count;
        if (avg > highestAvg) {
          highestAvg = avg;
          bestGame = gid;
        }
      }
    }
  }

  const dayIndex = new Date().getDate();
  const theme = THEMES[dayIndex % THEMES.length]!;

  const reasons: Record<GameId, string> = {
    match: "Member has shown strong engagement with visual matching activities.",
    pattern: "Sequence memory exercises support sustained attention.",
    find: "Visual tracking activities encourage focused observation.",
    signals: "Signal recall exercises support short-term memory engagement.",
  };

  return {
    gameId: bestGame,
    title: GAME_NAMES[bestGame],
    theme,
    reason: reasons[bestGame],
  };
}

const FALLBACK_MEMORY: Memory = {
  id: "fallback",
  memberId: "any",
  title: "A Beautiful Day",
  people: "Family",
  place: "Home",
  year: 2020,
  occasion: "An ordinary day",
  story: "Sometimes the most beautiful memories are the quiet, ordinary moments we share together.",
  theme: "family",
  emoji: "🌼",
  offline: true,
};

/** Select a memory for today based on calendar day. Safe for empty member data. */
export function memoryOfTheDay(memberId: string): Memory {
  const list = memories.filter((m) => m.memberId === memberId);
  if (list.length === 0) return { ...FALLBACK_MEMORY, memberId };
  const dayIndex = new Date().getDate() % list.length;
  return list[dayIndex] ?? list[0] ?? { ...FALLBACK_MEMORY, memberId };
}

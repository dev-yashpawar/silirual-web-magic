import { gameSessions, memories } from "./demo-data";
import type { GameId, GameSession } from "./types";

/**
 * Simulated personalisation engine for the demo build.
 * Outputs are activity suggestions only — never a medical judgement.
 */

export function nextDifficulty(sessions: GameSession[], gameId: GameId, current: number) {
  const recent = sessions.filter((s) => s.gameId === gameId).slice(-3);
  if (recent.length === 0) return current;
  const avg = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
  if (avg >= 85) return current + 1;
  if (avg < 60) return Math.max(1, current - 1);
  return current;
}

export interface Insight {
  label: string;
  value: "High" | "Strong" | "Moderate" | "Gentle";
}

export function insightsFor(memberId: string): Insight[] {
  const sessions = gameSessions.filter((s) => s.memberId === memberId);
  const avg = sessions.length
    ? sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length
    : 70;
  return [
    { label: "Memory recognition", value: avg > 80 ? "High" : "Moderate" },
    { label: "Visual recognition", value: avg > 75 ? "Strong" : "Moderate" },
    { label: "Attention", value: avg > 85 ? "Strong" : "Moderate" },
    { label: "Routine recall", value: "Moderate" },
    { label: "Nostalgia engagement", value: "High" },
  ];
}

export function recommendation(memberId: string) {
  const themes = ["Family", "Music", "Hometown", "Festivals"];
  const sessions = gameSessions.filter((s) => s.memberId === memberId);
  const best = [...sessions].sort((a, b) => b.accuracy - a.accuracy)[0];
  const gameId: GameId = best?.gameId ?? "match";
  return {
    themes,
    gameId,
    title: "Family Memory Match",
    reason: "Member has shown strong engagement with family-related memories.",
  };
}

export function memoryOfTheDay(memberId: string) {
  const list = memories.filter((m) => m.memberId === memberId);
  const dayIndex = new Date().getDate() % Math.max(1, list.length);
  return list[dayIndex] ?? list[0]!;
}

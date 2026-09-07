import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSilirual } from "@/lib/silirual/store";
import { GameFrame } from "./game-frame";
import { nextDifficulty } from "@/lib/silirual/ai-engine";
import { playTileTone, playSuccess, playCelebration, playEncouragement } from "@/lib/silirual/audio-engine";
import type { GameSession } from "@/lib/silirual/types";

/**
 * Memory Signals Game
 * Show a sequence of colored signals. Member repeats them in order.
 * Level 1: 1 signal, Level 2: 2 signals, Level 3: 3 signals, etc.
 * Each successful round adds one more signal to the sequence.
 *
 * Remember the Pattern Game (signals=false)
 * Same mechanic but with 5 colored tiles instead of 4 signal circles.
 * Uses square tiles with brightness animation.
 */

const SIGNAL_COLORS = [
  { id: 0, emoji: "🔵", bg: "bg-blue-500", label: "Blue" },
  { id: 1, emoji: "🟢", bg: "bg-green-500", label: "Green" },
  { id: 2, emoji: "🟡", bg: "bg-yellow-400", label: "Yellow" },
  { id: 3, emoji: "🔴", bg: "bg-red-500", label: "Red" },
];

const PATTERN_TILES = [
  { id: 0, cls: "bg-tile-1", label: "Blue" },
  { id: 1, cls: "bg-tile-2", label: "Green" },
  { id: 2, cls: "bg-tile-3", label: "Red" },
  { id: 3, cls: "bg-tile-4", label: "Yellow" },
  { id: 4, cls: "bg-tile-5", label: "Purple" },
];

type Phase = "idle" | "watch" | "input" | "result";

export function PatternGame({ signals = false }: { signals?: boolean }) {
  const {
    t,
    buzz,
    speak,
    bestLevels,
    recordBest,
    settings,
    recordGameSession,
    gameSessions,
    member,
  } = useSilirual();

  const gameId = signals ? "signals" as const : "pattern" as const;
  const items = signals ? SIGNAL_COLORS : PATTERN_TILES;

  const [sequence, setSequence] = useState<number[]>([]);
  const [inputStep, setInputStep] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState(
    signals ? t("games.signalsDesc") : t("games.patternDesc"),
  );
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const saveSession = (completed: boolean, lvl: number, att: number, st: number) => {
    if (att === 0 && !completed) return;
    const responseMs = Date.now() - st;
    const accuracy = att === 0 ? 0 : Math.min(100, Math.round((lvl / att) * 100));
    const session: GameSession = {
      id: `gs-${Date.now()}`,
      memberId: member.id,
      gameId,
      level: lvl,
      accuracy,
      responseMs,
      attempts: att,
      completed,
      date: new Date().toISOString().split("T")[0]!,
    };
    recordGameSession(session);
    return session;
  };

  /**
   * Play the sequence visually and with audio.
   * After playback, switch to input phase.
   */
  const playSequence = useCallback(
    (seq: number[]) => {
      setPhase("watch");
      setMessage(t("games.watch"));
      speak(t("games.watch"));

      const gap = settings.comfortableSpeed ? 1000 : 750;

      seq.forEach((tileId, i) => {
        // Light up
        timersRef.current.push(
          window.setTimeout(() => {
            setLit(tileId);
            playTileTone(tileId);
            buzz(10);
          }, gap * (i + 1)),
        );
        // Light off
        timersRef.current.push(
          window.setTimeout(() => setLit(null), gap * (i + 1) + gap * 0.55),
        );
      });

      // After all signals played, switch to input
      timersRef.current.push(
        window.setTimeout(() => {
          setPhase("input");
          setInputStep(0);
          setMessage(t("games.yourTurn"));
          speak(t("games.yourTurn"));
        }, gap * (seq.length + 1)),
      );
    },
    [buzz, speak, t, settings.comfortableSpeed],
  );

  /**
   * Start a new round at the given level.
   * If existingSeq is provided, append one random item to it (progressive growth).
   * If not, build a completely new sequence.
   */
  const startRound = (nextLevel: number, existingSeq: number[] = []) => {
    clearTimers();

    const seq = [...existingSeq];
    while (seq.length < nextLevel) {
      seq.push(Math.floor(Math.random() * items.length));
    }

    setSequence(seq);
    setLevel(nextLevel);
    setAttempts(0);
    setInputStep(0);

    const now = Date.now();
    setStartTime(now);

    playSequence(seq);
  };

  /**
   * Handle user tapping a tile/signal.
   */
  const tap = (id: number) => {
    if (phase !== "input") return;

    buzz(14);
    playTileTone(id);

    // Flash the tapped tile
    setLit(id);
    timersRef.current.push(
      window.setTimeout(() => setLit(null), 250),
    );

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const expected = sequence[inputStep];

    if (id === expected) {
      // Correct tap
      if (inputStep + 1 === sequence.length) {
        // Entire sequence completed!
        setPhase("result");
        setMessage(t("games.correct"));
        speak(t("games.correct"));
        playSuccess();
        buzz([25, 60, 25]);
        recordBest(gameId, level);

        const session = saveSession(true, level, newAttempts, startTime!);

        // Auto-advance: add one more signal to the sequence
        timersRef.current.push(
          window.setTimeout(() => {
            playCelebration();
            const allSessions = session ? [...gameSessions, session] : gameSessions;
            const nextLvl = nextDifficulty(allSessions, gameId, level);
            // If next level is level+1, grow the existing sequence
            if (nextLvl === level + 1) {
              startRound(nextLvl, sequence);
            } else {
              startRound(nextLvl);
            }
          }, 2000),
        );
      } else {
        // Move to next step in the sequence
        setInputStep(inputStep + 1);
      }
    } else {
      // Wrong tap — gentle encouragement
      setPhase("result");
      setMessage(t("games.incorrect"));
      speak(t("games.incorrect"));
      playEncouragement();
      buzz(40);
      saveSession(false, level, newAttempts, startTime!);
    }
  };

  return (
    <GameFrame
      title={signals ? t("games.signalsFull") : t("games.patternFull")}
      level={level}
      best={bestLevels[gameId] ?? 1}
      message={message}
      score={inputStep * 10}
      attempts={attempts}
      startTime={phase !== "idle" ? startTime : null}
      onRestart={phase !== "idle" ? () => startRound(level) : undefined}
    >
      {/* Tiles / Signals grid */}
      {phase !== "idle" && (
        <div
          className={`grid gap-4 ${
            signals
              ? "grid-cols-2 max-w-xs mx-auto"
              : items.length <= 4
                ? "grid-cols-2 max-w-sm mx-auto"
                : "grid-cols-2 sm:grid-cols-3 max-w-md mx-auto"
          }`}
        >
          {items.map((item) => {
            const isLit = lit === item.id;

            if (signals) {
              // Signals mode: large colored circles with emoji
              const signal = item as (typeof SIGNAL_COLORS)[number];
              return (
                <button
                  key={signal.id}
                  type="button"
                  aria-label={signal.label}
                  disabled={phase !== "input"}
                  onClick={() => tap(signal.id)}
                  className={`flex min-h-32 items-center justify-center rounded-full text-7xl transition-all duration-300 ${
                    isLit
                      ? "opacity-100 scale-110 shadow-lg bg-card"
                      : phase === "input"
                        ? "opacity-50 bg-secondary hover:opacity-70 active:scale-95"
                        : "opacity-25 bg-secondary"
                  }`}
                >
                  <span aria-hidden="true" className="select-none">{signal.emoji}</span>
                </button>
              );
            }

            // Pattern mode: colored square tiles with brightness animation
            const tile = item as (typeof PATTERN_TILES)[number];
            return (
              <button
                key={tile.id}
                type="button"
                aria-label={tile.label}
                disabled={phase !== "input"}
                onClick={() => tap(tile.id)}
                className={`${tile.cls} min-h-32 rounded-3xl shadow-[var(--shadow-soft)] transition-all duration-200 ${
                  isLit
                    ? "signal-lit brightness-150 scale-105"
                    : phase === "input"
                      ? "hover:brightness-110 active:scale-95"
                      : "opacity-60"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Sequence progress indicator during input */}
      {phase === "input" && (
        <div className="flex justify-center gap-2 mt-2">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-colors ${
                i < inputStep ? "bg-success" : i === inputStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}

      {/* Start / Try Again button */}
      {(phase === "idle" || phase === "result") && (
        <div className="flex flex-col items-center gap-3">
          {phase === "result" && (
            <p className="text-center text-lg text-muted-foreground">
              {sequence.length > 0
                ? t("games.encouragement4")
                : ""}
            </p>
          )}
          <Button
            variant="gentle"
            size="big"
            onClick={() => {
              if (phase === "idle") {
                startRound(1);
              } else {
                // On failure, step difficulty down
                startRound(Math.max(1, level - 1));
              }
            }}
          >
            {phase === "idle" ? t("games.start") : t("games.tryAgain")}
          </Button>
        </div>
      )}
    </GameFrame>
  );
}

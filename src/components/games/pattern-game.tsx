import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSilirual } from "@/lib/silirual/store";
import { GameFrame } from "./game-frame";

const TILES = [
  { id: 0, cls: "bg-tile-1", label: "Blue" },
  { id: 1, cls: "bg-tile-2", label: "Green" },
  { id: 2, cls: "bg-tile-3", label: "Red" },
  { id: 3, cls: "bg-tile-4", label: "Yellow" },
  { id: 4, cls: "bg-tile-5", label: "Purple" },
];

type Phase = "idle" | "watch" | "input" | "result";

export function PatternGame({ signals = false }: { signals?: boolean }) {
  const { t, buzz, speak, bestLevels, recordBest, settings } = useSilirual();
  const gameId = signals ? "signals" : "pattern";
  const tiles = signals ? TILES.slice(0, 4) : TILES;
  const [sequence, setSequence] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState(
    signals ? t("games.signalsDesc") : t("games.patternDesc"),
  );
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const playSequence = useCallback(
    (seq: number[]) => {
      setPhase("watch");
      setMessage(t("games.watch"));
      speak(t("games.watch"));
      const gap = settings.comfortableSpeed ? 1100 : 800;
      seq.forEach((tile, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setLit(tile);
            buzz(10);
          }, gap * (i + 1)),
        );
        timers.current.push(
          window.setTimeout(() => setLit(null), gap * (i + 1) + gap * 0.6),
        );
      });
      timers.current.push(
        window.setTimeout(
          () => {
            setPhase("input");
            setStep(0);
            setMessage(t("games.yourTurn"));
            speak(t("games.yourTurn"));
          },
          gap * (seq.length + 1),
        ),
      );
    },
    [buzz, speak, t, settings.comfortableSpeed],
  );

  const startRound = (nextLevel: number, seed: number[] = []) => {
    clearTimers();
    const seq = [...seed];
    while (seq.length < nextLevel) {
      seq.push(Math.floor(Math.random() * tiles.length));
    }
    setSequence(seq);
    setLevel(nextLevel);
    playSequence(seq);
  };

  const tap = (id: number) => {
    if (phase !== "input") return;
    buzz(14);
    setLit(id);
    window.setTimeout(() => setLit(null), 260);
    if (sequence[step] === id) {
      if (step + 1 === sequence.length) {
        setPhase("result");
        setMessage(t("games.correct"));
        speak(t("games.correct"));
        buzz([25, 60, 25]);
        recordBest(gameId, sequence.length);
        timers.current.push(window.setTimeout(() => startRound(level + 1, sequence), 1800));
      } else {
        setStep(step + 1);
      }
    } else {
      setPhase("result");
      setMessage(t("games.incorrect"));
      speak(t("games.incorrect"));
      buzz(40);
    }
  };

  return (
    <GameFrame
      title={signals ? t("games.signals") : t("games.pattern")}
      level={level}
      best={bestLevels[gameId] ?? 1}
      message={message}
    >
      <div
        className={`grid gap-4 ${signals ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}
      >
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            aria-label={tile.label}
            disabled={phase !== "input"}
            onClick={() => tap(tile.id)}
            className={`${tile.cls} ${
              lit === tile.id ? "signal-lit brightness-150" : ""
            } min-h-32 rounded-3xl shadow-[var(--shadow-soft)] transition-all disabled:opacity-70 ${
              signals ? "rounded-full" : ""
            }`}
          />
        ))}
      </div>

      {phase === "idle" || phase === "result" ? (
        <Button variant="gentle" size="big" onClick={() => startRound(phase === "idle" ? 1 : level)}>
          {phase === "idle" ? t("games.start") : t("games.tryAgain")}
        </Button>
      ) : null}
    </GameFrame>
  );
}

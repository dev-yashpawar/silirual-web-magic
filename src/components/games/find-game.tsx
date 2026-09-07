import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSilirual } from "@/lib/silirual/store";
import { GameFrame } from "./game-frame";

const OBJECTS = ["🍊", "🫖", "🌼", "🥭", "🪔", "🧺"];

type Phase = "idle" | "show" | "shuffle" | "ask" | "result";

export function FindGame() {
  const { t, buzz, speak, bestLevels, recordBest, settings } = useSilirual();
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [position, setPosition] = useState(1);
  const [object, setObject] = useState(OBJECTS[0]!);
  const [message, setMessage] = useState(t("games.findDesc"));
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const start = (nextLevel: number) => {
    clearTimers();
    setLevel(nextLevel);
    const startPos = Math.floor(Math.random() * 3);
    setPosition(startPos);
    setObject(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!);
    setPhase("show");
    setMessage(t("games.watch"));
    speak(t("games.watch"));

    const moves = nextLevel + 1;
    const base = settings.comfortableSpeed ? 1200 : 900;
    const speed = Math.max(420, base - (nextLevel - 1) * 130);

    timers.current.push(
      window.setTimeout(() => {
        setPhase("shuffle");
        let current = startPos;
        for (let i = 0; i < moves; i++) {
          timers.current.push(
            window.setTimeout(() => {
              current = (current + 1 + Math.floor(Math.random() * 2)) % 3;
              setPosition(current);
              buzz(8);
            }, speed * (i + 1)),
          );
        }
        timers.current.push(
          window.setTimeout(
            () => {
              setPhase("ask");
              setMessage(t("games.whereIsIt"));
              speak(t("games.whereIsIt"));
            },
            speed * (moves + 1),
          ),
        );
      }, 1800),
    );
  };

  const pick = (cup: number) => {
    if (phase !== "ask") return;
    buzz(14);
    setPhase("result");
    if (cup === position) {
      setMessage(t("games.found"));
      speak(t("games.found"));
      buzz([25, 60, 25]);
      recordBest("find", level);
      timers.current.push(window.setTimeout(() => start(level + 1), 2000));
    } else {
      setMessage(t("games.notFound"));
      speak(t("games.notFound"));
      buzz(40);
    }
  };

  const revealed = phase === "show" || phase === "result";

  return (
    <GameFrame title={t("games.find")} level={level} best={bestLevels.find ?? 1} message={message}>
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {[0, 1, 2].map((cup) => (
          <button
            key={cup}
            type="button"
            aria-label={`Cup ${cup + 1}`}
            disabled={phase !== "ask"}
            onClick={() => pick(cup)}
            className="card-soft flex min-h-40 flex-col items-center justify-end gap-2 bg-secondary p-3 transition-transform enabled:hover:-translate-y-1"
          >
            <span className="text-5xl" aria-hidden="true">
              {revealed && position === cup ? object : ""}
            </span>
            <span className="text-6xl" aria-hidden="true">
              🥣
            </span>
          </button>
        ))}
      </div>

      {phase === "idle" || phase === "result" ? (
        <Button variant="gentle" size="big" onClick={() => start(phase === "idle" ? 1 : level)}>
          {phase === "idle" ? t("games.start") : t("games.tryAgain")}
        </Button>
      ) : null}
    </GameFrame>
  );
}

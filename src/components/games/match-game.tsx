import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSilirual } from "@/lib/silirual/store";
import { GameFrame } from "./game-frame";

const IMAGES = ["🥭", "🌼", "🐘", "🫖", "🪘", "🏡", "🎉", "🌿"];

interface Card {
  key: string;
  face: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(pairs: number): Card[] {
  const faces = IMAGES.slice(0, pairs);
  const deck = [...faces, ...faces]
    .map((face, i) => ({ key: `${face}-${i}`, face, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

export function MatchGame() {
  const { t, buzz, speak, bestLevels, recordBest } = useSilirual();
  const [level, setLevel] = useState(1);
  const [deck, setDeck] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [message, setMessage] = useState(t("games.matchDesc"));
  const [started, setStarted] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const start = (nextLevel: number) => {
    setLevel(nextLevel);
    setDeck(buildDeck(nextLevel + 1));
    setOpen([]);
    setStarted(true);
    setMessage(t("games.matchDesc"));
  };

  const flip = (index: number) => {
    if (open.length === 2 || deck[index]?.flipped || deck[index]?.matched) return;
    buzz(12);
    const next = deck.map((c, i) => (i === index ? { ...c, flipped: true } : c));
    const opened = [...open, index];
    setDeck(next);
    setOpen(opened);

    if (opened.length === 2) {
      const [a, b] = opened as [number, number];
      const isMatch = next[a]!.face === next[b]!.face;
      timer.current = window.setTimeout(() => {
        const resolved = next.map((c, i) =>
          i === a || i === b ? { ...c, matched: isMatch, flipped: isMatch } : c,
        );
        setDeck(resolved);
        setOpen([]);
        if (isMatch) {
          buzz([20, 50, 20]);
          if (resolved.every((c) => c.matched)) {
            setMessage(t("games.correct"));
            speak(t("games.correct"));
            recordBest("match", level);
            timer.current = window.setTimeout(() => start(level + 1), 2200);
          }
        }
      }, 1100);
    }
  };

  const found = deck.filter((c) => c.matched).length / 2;

  return (
    <GameFrame title={t("games.match")} level={level} best={bestLevels.match ?? 1} message={message}>
      {started ? (
        <>
          <p className="text-lg text-muted-foreground">
            {t("games.pairsFound")}: {found} / {level + 1}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {deck.map((card, i) => (
              <button
                key={card.key}
                type="button"
                aria-label={card.flipped || card.matched ? card.face : "Hidden card"}
                onClick={() => flip(i)}
                className={`card-soft flex min-h-28 items-center justify-center text-5xl transition-transform ${
                  card.matched
                    ? "bg-success-soft"
                    : card.flipped
                      ? "bg-accent-soft"
                      : "bg-primary-soft"
                }`}
              >
                <span aria-hidden="true">{card.flipped || card.matched ? card.face : "❔"}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <Button variant="gentle" size="big" onClick={() => start(started ? level : 1)}>
        {started ? t("games.tryAgain") : t("games.start")}
      </Button>
    </GameFrame>
  );
}

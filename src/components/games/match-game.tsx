import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSilirual } from "@/lib/silirual/store";
import { GameFrame } from "./game-frame";
import { nextDifficulty } from "@/lib/silirual/ai-engine";
import {
  playCardFlip,
  playCardMatch,
  playCelebration,
  playEncouragement,
} from "@/lib/silirual/audio-engine";
import type { GameSession } from "@/lib/silirual/types";

// Culturally familiar objects: fruits, animals, festivals, home items
const IMAGES = [
  "🥭", "🌼", "🐘", "🫖", "🪘", "🏡", "🎉",
  "🌿", "🪔", "🧺", "🍊", "🎊", "🐟", "🌾",
];

interface Card {
  id: number;
  face: string;
  flipped: boolean;
  matched: boolean;
}

/**
 * Build a deck of card pairs for a given level.
 * Level 1 = 2 pairs, Level 2 = 3 pairs, Level 3 = 4 pairs, etc.
 */
function buildDeck(level: number): Card[] {
  const pairs = level + 1;
  const faces = IMAGES.slice(0, Math.min(pairs, IMAGES.length));
  const cards: Card[] = [];
  let id = 0;
  for (const face of faces) {
    cards.push({ id: id++, face, flipped: false, matched: false });
    cards.push({ id: id++, face, flipped: false, matched: false });
  }
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

export function MatchGame() {
  const {
    t,
    buzz,
    speak,
    bestLevels,
    recordBest,
    recordGameSession,
    gameSessions,
    member,
  } = useSilirual();

  const [level, setLevel] = useState(1);
  const [deck, setDeck] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState(t("games.matchDesc"));
  const [started, setStarted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [matchesFound, setMatchesFound] = useState(0);
  const [locked, setLocked] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const totalPairs = Math.floor(deck.length / 2);

  const saveSession = (completed: boolean, lvl: number, att: number, st: number) => {
    if (att === 0 && !completed) return;
    const responseMs = Date.now() - st;
    const accuracy = att === 0 ? 0 : Math.min(100, Math.round(((lvl + 1) / att) * 100));
    const session: GameSession = {
      id: `gs-${Date.now()}`,
      memberId: member.id,
      gameId: "match",
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

  const startGame = (nextLevel: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setLevel(nextLevel);
    setDeck(buildDeck(nextLevel));
    setSelected([]);
    setMatchesFound(0);
    setAttempts(0);
    setLocked(false);
    setStarted(true);
    setStartTime(Date.now());
    setMessage(t("games.matchDesc"));
  };

  const flip = (index: number) => {
    if (locked) return;
    const card = deck[index];
    if (!card || card.flipped || card.matched) return;
    if (selected.includes(index)) return;

    playCardFlip();
    buzz(8);

    // Flip this card
    const newDeck = deck.map((c, i) => (i === index ? { ...c, flipped: true } : c));
    const newSelected = [...selected, index];
    setDeck(newDeck);
    setSelected(newSelected);

    // If we now have 2 cards selected, check for match
    if (newSelected.length === 2) {
      setLocked(true);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const [a, b] = newSelected as [number, number];
      const cardA = newDeck[a]!;
      const cardB = newDeck[b]!;
      const isMatch = cardA.face === cardB.face;

      if (isMatch) {
        // Match found!
        playCardMatch();
        const newMatches = matchesFound + 1;
        setMatchesFound(newMatches);

        // Mark as matched
        const matchedDeck = newDeck.map((c, i) =>
          i === a || i === b ? { ...c, matched: true } : c,
        );
        setDeck(matchedDeck);
        setSelected([]);
        setLocked(false);

        // Random encouragement
        const encouragements = [
          t("games.encouragement1"),
          t("games.encouragement2"),
          t("games.encouragement3"),
        ];
        const enc = encouragements[Math.floor(Math.random() * encouragements.length)];
        if (enc && Math.random() > 0.4) {
          speak(enc);
          playEncouragement();
        }

        // Check if all pairs found
        const allPairs = level + 1;
        if (newMatches >= allPairs) {
          // Level complete!
          setMessage(t("games.correct"));
          speak(t("games.correct"));
          playCelebration();
          buzz([25, 60, 25]);
          recordBest("match", level);

          const session = saveSession(true, level, newAttempts, startTime!);

          timerRef.current = window.setTimeout(() => {
            const allSessions = session ? [...gameSessions, session] : gameSessions;
            const nextLvl = nextDifficulty(allSessions, "match", level);
            startGame(nextLvl);
          }, 2500);
        }
      } else {
        // No match — show both briefly, then flip back
        speak(t("games.encouragement4"));

        timerRef.current = window.setTimeout(() => {
          const flippedBack = newDeck.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c,
          );
          setDeck(flippedBack);
          setSelected([]);
          setLocked(false);
        }, 1200);
      }
    }
  };

  // Grid columns: 2 for small levels, 3 for medium, 4 for large
  const cols = totalPairs <= 3 ? 2 : totalPairs <= 5 ? 3 : 4;

  return (
    <GameFrame
      title={t("games.matchFull")}
      level={level}
      best={bestLevels.match ?? 1}
      message={message}
      score={matchesFound * 10}
      attempts={attempts}
      startTime={started ? startTime : null}
      onRestart={started ? () => startGame(level) : undefined}
    >
      {started ? (
        <div className={`grid gap-3 grid-cols-${cols}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {deck.map((card, i) => (
            <button
              key={card.id}
              type="button"
              aria-label={card.flipped || card.matched ? card.face : t("games.matchDesc")}
              onClick={() => flip(i)}
              disabled={locked}
              className={`card-soft flex min-h-24 items-center justify-center text-5xl transition-all duration-300 ${
                card.matched
                  ? "bg-success-soft match-glow scale-[1.03]"
                  : card.flipped
                    ? "bg-accent-soft scale-[1.02]"
                    : "bg-primary-soft hover:bg-primary-soft/80 active:scale-95"
              }`}
            >
              <span aria-hidden="true" className="select-none">
                {card.flipped || card.matched ? card.face : "❔"}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-lg text-muted-foreground">
            {t("games.matchDesc")}
          </p>
          <Button variant="gentle" size="big" onClick={() => startGame(1)}>
            {t("games.start")}
          </Button>
        </div>
      )}
    </GameFrame>
  );
}

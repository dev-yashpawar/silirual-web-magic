import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSilirual } from "@/lib/silirual/store";
import { GameFrame } from "./game-frame";
import { nextDifficulty } from "@/lib/silirual/ai-engine";
import { playCupShuffle, playSuccess, playCelebration, playEncouragement } from "@/lib/silirual/audio-engine";
import type { GameSession } from "@/lib/silirual/types";

/**
 * Find & Remember (Three Cups / Shell Game)
 *
 * Always 3 cups. Difficulty increases by:
 * - Increasing shuffle speed
 * - Increasing number of swaps
 *
 * Flow:
 * 1. Show 3 cups, place an object under one (reveal phase)
 * 2. Shuffle the cups with visible animation (shuffle phase)
 * 3. Ask "Where is the object?" (ask phase)
 * 4. Member taps a cup (result phase)
 */

const OBJECTS = ["🍎", "🥭", "🌼", "🫖", "🪔", "🧺"];
const CUP_EMOJI = "🥣";

type Phase = "idle" | "reveal" | "shuffle" | "ask" | "result";

interface LevelConfig {
  swapCount: number;
  swapSpeed: number; // ms per swap
}

/** Get shuffle config for a level. Always 3 cups. */
function getLevelConfig(level: number, comfortable: boolean): LevelConfig {
  const baseSpeed = comfortable ? 900 : 700;
  const minSpeed = comfortable ? 400 : 300;

  return {
    swapCount: Math.min(2 + level, 12), // Level 1: 3 swaps, Level 2: 4, etc.
    swapSpeed: Math.max(minSpeed, baseSpeed - (level - 1) * 80),
  };
}

export function FindGame() {
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

  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState(t("games.findDesc"));
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // The hidden object
  const [object, setObject] = useState(OBJECTS[0]!);

  // Which cup index (0, 1, 2) has the object under it.
  // This tracks the LOGICAL position of the object through swaps.
  const [objectCup, setObjectCup] = useState(0);

  // Visual position offsets for animation.
  // cupOffsets[cupIndex] = which visual slot (0, 1, 2) this cup is currently in.
  // Initially cup 0 is in slot 0, cup 1 in slot 1, cup 2 in slot 2.
  const [cupSlots, setCupSlots] = useState([0, 1, 2]);

  // Whether to show the object under a cup (during reveal and result)
  const [showObject, setShowObject] = useState(false);

  // On incorrect guess, show where the object actually was
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [guessedCup, setGuessedCup] = useState<number | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);

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
    const accuracy = completed ? 100 : 0;
    const session: GameSession = {
      id: `gs-${Date.now()}`,
      memberId: member.id,
      gameId: "find",
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
   * Start a new round at the given level.
   */
  const startRound = (nextLevel: number) => {
    clearTimers();

    setLevel(nextLevel);
    setPhase("reveal");
    setAttempts(0);
    setGuessedCup(null);
    setRevealCorrect(false);
    setWasCorrect(false);

    // Pick a random cup to hide the object under
    const hideCup = Math.floor(Math.random() * 3);
    setObjectCup(hideCup);

    // Reset visual positions
    setCupSlots([0, 1, 2]);

    // Pick a random object
    setObject(OBJECTS[Math.floor(Math.random() * OBJECTS.length)]!);

    // Show the object under the cup
    setShowObject(true);
    setMessage(t("games.watch"));
    speak(t("games.watch"));

    const now = Date.now();
    setStartTime(now);

    // After showing, start the shuffle
    const config = getLevelConfig(nextLevel, settings.comfortableSpeed);
    const revealDuration = 2000;

    timersRef.current.push(
      window.setTimeout(() => {
        // Hide the object and start shuffling
        setShowObject(false);
        setPhase("shuffle");

        runShuffle(hideCup, config);
      }, revealDuration),
    );
  };

  /**
   * Run the shuffle animation. Swaps pairs of cups visually.
   */
  const runShuffle = (initialObjectCup: number, config: LevelConfig) => {
    const { swapCount, swapSpeed } = config;

    // Pre-compute all the swaps
    let currentObjCup = initialObjectCup;
    const currentSlots = [0, 1, 2];

    for (let i = 0; i < swapCount; i++) {
      const delay = swapSpeed * (i + 1);

      // Pick two distinct cups to swap
      const cupA = Math.floor(Math.random() * 3);
      let cupB = (cupA + 1 + Math.floor(Math.random() * 2)) % 3;

      // Capture values for the closure
      const swapA = cupA;
      const swapB = cupB;

      // Track where the object moves
      if (currentObjCup === swapA) currentObjCup = swapB;
      else if (currentObjCup === swapB) currentObjCup = swapA;

      // Swap the visual slots
      const tempSlot = currentSlots[swapA]!;
      currentSlots[swapA] = currentSlots[swapB]!;
      currentSlots[swapB] = tempSlot;

      // Capture the current state of slots for this swap
      const slotsSnapshot = [...currentSlots];
      const objCupSnapshot = currentObjCup;

      timersRef.current.push(
        window.setTimeout(() => {
          setCupSlots(slotsSnapshot);
          setObjectCup(objCupSnapshot);
          playCupShuffle();
          buzz(6);
        }, delay),
      );
    }

    // After all swaps, transition to "ask" phase
    timersRef.current.push(
      window.setTimeout(() => {
        setPhase("ask");
        setMessage(t("games.whereIsIt"));
        speak(t("games.whereIsIt"));
      }, swapSpeed * (swapCount + 1) + 300),
    );
  };

  /**
   * Handle cup selection.
   */
  const pickCup = (cupIndex: number) => {
    if (phase !== "ask") return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuessedCup(cupIndex);
    setPhase("result");
    buzz(14);

    if (cupIndex === objectCup) {
      // Correct!
      setWasCorrect(true);
      setShowObject(true);
      setMessage(t("games.found"));
      speak(t("games.found"));
      playSuccess();
      buzz([25, 60, 25]);
      recordBest("find", level);

      const session = saveSession(true, level, newAttempts, startTime!);

      timersRef.current.push(
        window.setTimeout(() => {
          playCelebration();
          const allSessions = session ? [...gameSessions, session] : gameSessions;
          const nextLvl = nextDifficulty(allSessions, "find", level);
          startRound(nextLvl);
        }, 2500),
      );
    } else {
      // Incorrect — reveal where the object actually was
      setWasCorrect(false);
      setRevealCorrect(true);
      setShowObject(true);
      setMessage(t("games.notFound"));
      speak(t("games.notFound"));
      playEncouragement();
      buzz(40);
      saveSession(false, level, newAttempts, startTime!);
    }
  };

  /**
   * Compute the CSS transform for a cup based on its visual slot.
   * Cup i's natural position is slot i. If it's now in slot j,
   * it needs to translate by (j - i) columns.
   */
  const getCupStyle = (cupIndex: number): React.CSSProperties => {
    const slot = cupSlots[cupIndex]!;
    const diff = slot - cupIndex;

    return {
      transform: `translateX(calc(${diff} * (100% + 0.75rem)))`,
      transition: phase === "shuffle" ? "transform 0.4s ease-in-out" : "transform 0.1s ease",
    };
  };

  return (
    <GameFrame
      title={t("games.findFull")}
      level={level}
      best={bestLevels.find ?? 1}
      message={message}
      attempts={attempts}
      startTime={phase !== "idle" ? startTime : null}
      onRestart={phase !== "idle" && phase !== "shuffle" ? () => startRound(level) : undefined}
    >
      {/* Cups area */}
      {phase !== "idle" && (
        <div className="flex flex-col items-center gap-6">
          {/* Object indicator */}
          <div className="text-center text-4xl" aria-label={`Find the ${object}`}>
            {object}
          </div>

          {/* 3 Cups in a grid */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
            {[0, 1, 2].map((cupIndex) => {
              const isObjectHere = cupIndex === objectCup;
              const isGuessed = guessedCup === cupIndex;
              const showObjectHere = showObject && isObjectHere;

              // Highlight styling
              let cupBg = "bg-secondary";
              if (phase === "result" && isGuessed && wasCorrect) {
                cupBg = "bg-success-soft";
              } else if (phase === "result" && isGuessed && !wasCorrect) {
                cupBg = "bg-warning-soft";
              } else if (phase === "result" && revealCorrect && isObjectHere) {
                cupBg = "bg-success-soft";
              }

              return (
                <button
                  key={cupIndex}
                  type="button"
                  aria-label={`Cup ${cupIndex + 1}`}
                  disabled={phase !== "ask"}
                  onClick={() => pickCup(cupIndex)}
                  style={getCupStyle(cupIndex)}
                  className={`card-soft flex min-h-36 flex-col items-center justify-end gap-2 p-4 transition-colors ${cupBg} ${
                    phase === "ask"
                      ? "hover:bg-primary-soft active:scale-95 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  {/* Show the hidden object if revealed */}
                  <span className="text-4xl" aria-hidden="true">
                    {showObjectHere ? object : ""}
                  </span>
                  {/* The cup */}
                  <span className="text-6xl select-none" aria-hidden="true">
                    {CUP_EMOJI}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Start / Try Again */}
      {(phase === "idle" || (phase === "result" && !wasCorrect)) && (
        <div className="flex flex-col items-center gap-3">
          {phase === "result" && (
            <p className="text-center text-lg text-muted-foreground">
              {t("games.encouragement4")}
            </p>
          )}
          <Button
            variant="gentle"
            size="big"
            onClick={() => startRound(phase === "idle" ? 1 : Math.max(1, level - 1))}
          >
            {phase === "idle" ? t("games.start") : t("games.tryAgain")}
          </Button>
        </div>
      )}
    </GameFrame>
  );
}

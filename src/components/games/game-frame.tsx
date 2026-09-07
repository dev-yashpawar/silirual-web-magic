import { type ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/silirual/speak-button";
import { useSilirual } from "@/lib/silirual/store";

export function GameFrame({
  title,
  level,
  best,
  message,
  score,
  attempts,
  startTime,
  onRestart,
  children,
}: {
  title: string;
  level: number;
  best: number;
  message: string;
  score?: number;
  attempts?: number;
  startTime?: number | null;
  onRestart?: () => void;
  children: ReactNode;
}) {
  const { t, buzz } = useSilirual();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header: Back + Title + Restart */}
      <div className="flex items-center gap-3">
        <Button variant="calm" size="calm" asChild>
          <Link to="/member/games">
            <ArrowLeft aria-hidden="true" />
            <span>{t("common.back")}</span>
          </Link>
        </Button>
        <h1 className="flex-1 text-2xl font-semibold">{title}</h1>
        {onRestart && (
          <Button
            variant="calm"
            size="calm"
            onClick={() => {
              buzz(12);
              onRestart();
            }}
          >
            <RotateCcw aria-hidden="true" size={18} />
            <span>{t("games.restart")}</span>
          </Button>
        )}
      </div>

      {/* Stats row: Level, Best, Timer, Score, Attempts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary-soft px-4 py-2 text-lg font-medium text-primary">
          {t("games.level")} {level}
        </span>
        <span className="rounded-full bg-secondary px-4 py-2 text-lg">
          {t("games.best")}: {best}
        </span>
        {startTime != null && (
          <span className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-lg">
            <Clock size={18} aria-hidden="true" />
            {formatTime(elapsed)}
          </span>
        )}
        {score != null && (
          <span className="rounded-full bg-success-soft px-4 py-2 text-lg text-success">
            {t("games.score")}: {score}
          </span>
        )}
        {attempts != null && attempts > 0 && (
          <span className="rounded-full bg-accent-soft px-4 py-2 text-lg">
            {t("games.attempts")}: {attempts}
          </span>
        )}
      </div>

      {/* Message card */}
      <div className="card-soft flex items-center gap-3 bg-accent-soft p-4">
        <p className="flex-1 text-xl font-medium">{message}</p>
        <SpeakButton text={message} />
      </div>

      {/* Game content */}
      {children}
    </div>
  );
}

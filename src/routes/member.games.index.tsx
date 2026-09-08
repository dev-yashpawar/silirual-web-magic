import { createFileRoute, Link } from "@tanstack/react-router";
import { SpeakButton } from "@/components/silirual/speak-button";
import { recommendation } from "@/lib/silirual/ai-engine";
import { useSilirual } from "@/lib/silirual/store";
import type { GameId } from "@/lib/silirual/types";

export const Route = createFileRoute("/member/games/")({
  component: GamesList,
});

const GAMES: { id: GameId; to: "/member/games/pattern" | "/member/games/find" | "/member/games/match" | "/member/games/signals"; emoji: string; titleKey: string; descKey: string }[] = [
  { id: "match", to: "/member/games/match", emoji: "🃏", titleKey: "games.matchFull", descKey: "games.matchDesc" },
  { id: "signals", to: "/member/games/signals", emoji: "🔵", titleKey: "games.signalsFull", descKey: "games.signalsDesc" },
  { id: "find", to: "/member/games/find", emoji: "🥣", titleKey: "games.findFull", descKey: "games.findDesc" },
  { id: "pattern", to: "/member/games/pattern", emoji: "🟦", titleKey: "games.patternFull", descKey: "games.patternDesc" },
];

function GamesList() {
  const { t, bestLevels, member, buzz, gameSessions } = useSilirual();
  const rec = recommendation(member.id, gameSessions);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-3xl font-semibold">{t("games.title")}</h1>
        <SpeakButton text={t("games.title")} />
      </div>

      <p className="rounded-2xl bg-primary-soft p-4 text-lg text-primary">
        {t("member.activityReady")} <strong>{t(GAMES.find((g) => g.id === rec.gameId)?.titleKey ?? "games.matchFull")}</strong>
      </p>

      {GAMES.map((g) => (
        <Link
          key={g.id}
          to={g.to}
          onClick={() => buzz(15)}
          className="card-soft gentle-in flex min-h-32 items-center gap-4 bg-card p-5 transition-transform hover:-translate-y-0.5"
        >
          <span className="text-5xl" aria-hidden="true">
            {g.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-2xl font-semibold">{t(g.titleKey)}</span>
            <span className="block text-lg text-muted-foreground">{t(g.descKey)}</span>
            <span className="mt-1 block text-base text-primary">
              {t("games.best")}: {bestLevels[g.id] ?? 1}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

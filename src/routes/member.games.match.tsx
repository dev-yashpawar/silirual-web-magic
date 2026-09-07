import { createFileRoute } from "@tanstack/react-router";
import { MatchGame } from "@/components/games/match-game";

export const Route = createFileRoute("/member/games/match")({
  component: MatchGame,
});

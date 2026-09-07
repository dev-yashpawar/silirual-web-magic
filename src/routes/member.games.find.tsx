import { createFileRoute } from "@tanstack/react-router";
import { FindGame } from "@/components/games/find-game";

export const Route = createFileRoute("/member/games/find")({
  component: FindGame,
});

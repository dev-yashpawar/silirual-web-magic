import { createFileRoute } from "@tanstack/react-router";
import { PatternGame } from "@/components/games/pattern-game";

export const Route = createFileRoute("/member/games/signals")({
  component: () => <PatternGame signals />,
});

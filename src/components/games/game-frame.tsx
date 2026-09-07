import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/silirual/speak-button";
import { useSilirual } from "@/lib/silirual/store";

export function GameFrame({
  title,
  level,
  best,
  message,
  children,
}: {
  title: string;
  level: number;
  best: number;
  message: string;
  children: ReactNode;
}) {
  const { t } = useSilirual();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button variant="calm" size="calm" asChild>
          <Link to="/member/games">
            <ArrowLeft aria-hidden="true" />
            <span>{t("common.back")}</span>
          </Link>
        </Button>
        <h1 className="flex-1 text-2xl font-semibold">{title}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-primary-soft px-4 py-2 text-lg font-medium text-primary">
          {t("games.level")} {level}
        </span>
        <span className="rounded-full bg-secondary px-4 py-2 text-lg">
          {t("games.best")}: {best}
        </span>
      </div>

      <div className="card-soft flex items-center gap-3 bg-accent-soft p-4">
        <p className="flex-1 text-xl font-medium">{message}</p>
        <SpeakButton text={message} />
      </div>

      {children}
    </div>
  );
}

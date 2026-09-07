import { Link, Outlet } from "@tanstack/react-router";
import { Gamepad2, HeartHandshake, House, ListChecks, UserRound } from "lucide-react";
import { useSilirual } from "@/lib/silirual/store";

const items = [
  { to: "/member", labelKey: "nav.home", icon: House, exact: true },
  { to: "/member/games", labelKey: "nav.games", icon: Gamepad2, exact: false },
  { to: "/member/memories", labelKey: "nav.memories", icon: HeartHandshake, exact: false },
  { to: "/member/day", labelKey: "nav.day", icon: ListChecks, exact: false },
  { to: "/member/profile", labelKey: "nav.profile", icon: UserRound, exact: false },
] as const;

export function MemberShell() {
  const { t, member, online } = useSilirual();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/member" className="font-display text-xl font-semibold tracking-tight">
            SILIRUAL
          </Link>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              online ? "bg-success-soft text-success" : "bg-warning-soft text-warning-foreground"
            }`}
          >
            {online ? "🟢 " + t("common.synced") : "🟡 " + t("common.offline")}
          </span>
          <span className="text-lg font-medium">{member.name}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-5">
        <Outlet />
      </main>

      <nav
        aria-label={t("nav.home")}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/98 backdrop-blur"
      >
        <div className="mx-auto grid w-full max-w-3xl grid-cols-5">
          {items.map(({ to, labelKey, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              activeProps={{ className: "text-primary bg-primary-soft" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center"
            >
              <Icon className="size-7" aria-hidden="true" />
              <span className="text-sm leading-tight font-medium">{t(labelKey)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

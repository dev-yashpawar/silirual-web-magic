import { Link, Outlet, type LinkProps } from "@tanstack/react-router";
import { useSilirual } from "@/lib/silirual/store";
import { RoleSwitcher } from "@/components/silirual/role-switcher";

export interface CareNavItem {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  exact?: boolean;
}


export function CareShell({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: CareNavItem[];
}) {
  const { online } = useSilirual();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link to="/" className="font-display text-xl font-semibold">
                SILIRUAL
              </Link>
              <p className="text-sm text-muted-foreground">
                {title} · {subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  online ? "bg-success-soft text-success" : "bg-warning-soft text-warning-foreground"
                }`}
              >
                {online ? "🟢 Synced" : "🟡 Offline — will sync later"}
              </span>
              <RoleSwitcher />
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2" aria-label={`${title} sections`}>
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                inactiveProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="min-h-11 rounded-full px-4 py-2 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-6">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-6xl px-5 pb-10 text-sm text-muted-foreground">
        AI-generated activity insights are shown for engagement support only — not a medical
        diagnosis.
      </footer>
    </div>
  );
}

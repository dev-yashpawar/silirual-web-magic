import { Link } from "@tanstack/react-router";
import { useSilirual } from "@/lib/silirual/store";

const views = [
  { to: "/member", role: "member", label: "Member", emoji: "🧑" },
  { to: "/guardian", role: "guardian", label: "Family", emoji: "👨‍👩‍👧" },
  { to: "/care", role: "professional", label: "Care", emoji: "🩺" },
] as const;

export function RoleSwitcher({ className = "" }: { className?: string }) {
  const { setRole } = useSilirual();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">Viewing as</span>
      <div className="flex gap-1 rounded-full bg-secondary p-1">
        {views.map((v) => (
          <Link
            key={v.to}
            to={v.to}
            onClick={() => setRole(v.role as any)}
            activeProps={{ className: "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" }}
            inactiveProps={{ className: "text-secondary-foreground" }}
            className="flex min-h-11 items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
          >
            <span aria-hidden="true">{v.emoji}</span>
            {v.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

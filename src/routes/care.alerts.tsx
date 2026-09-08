import { createFileRoute } from "@tanstack/react-router";
import { alerts, members } from "@/lib/silirual/demo-data";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/care/alerts")({
  component: CareAlerts,
});

function CareAlerts() {
  const { t } = useSilirual();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Alerts</h1>
        <p className="text-lg text-muted-foreground">
          Activity notices across authorised members, written in calm language.
        </p>
      </div>

      <div className="grid gap-3">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`card-soft flex items-start gap-4 p-5 ${
              a.tone === "attention" ? "bg-warning-soft" : "bg-card"
            }`}
          >
            <span className="text-3xl" aria-hidden="true">
              {a.emoji}
            </span>
            <div>
              <p className="text-xl font-medium">{t(a.titleKey)}</p>
              <p className="text-lg text-muted-foreground">{a.detail}</p>
              <p className="text-sm text-muted-foreground">
                {members.find((m) => m.id === a.memberId)?.name} · {a.when}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

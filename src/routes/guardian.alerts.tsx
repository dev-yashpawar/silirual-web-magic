import { createFileRoute } from "@tanstack/react-router";
import { alerts } from "@/lib/silirual/demo-data";

export const Route = createFileRoute("/guardian/alerts")({
  component: GuardianAlerts,
});

function GuardianAlerts() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Alerts</h1>
        <p className="text-lg text-muted-foreground">
          Calm notices about routines and activity — nothing here is a medical alarm.
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
              <p className="text-xl font-medium">{a.titleKey}</p>
              <p className="text-lg text-muted-foreground">{a.detail}</p>
              <p className="text-sm text-muted-foreground">{a.when}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

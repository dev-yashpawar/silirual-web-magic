import { createFileRoute } from "@tanstack/react-router";
import { alerts, members } from "@/lib/silirual/demo-data";
import { insightsFor, recommendation } from "@/lib/silirual/ai-engine";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/guardian/")({
  component: GuardianDashboard,
});

function GuardianDashboard() {
  const { reminders, t, gameSessions } = useSilirual();
  const member = members[0]!;
  const insights = insightsFor(member.id, gameSessions);
  const rec = recommendation(member.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Good morning, Anita</h1>
        <p className="text-lg text-muted-foreground">Here is how Asha’s day is going.</p>
      </div>

      <section className="card-soft flex flex-wrap items-center gap-4 bg-primary-soft p-5">
        <span className="text-4xl" aria-hidden="true">
          👵
        </span>
        <div className="flex-1">
          <p className="text-2xl font-semibold">{member.name}</p>
          <p className="text-base text-muted-foreground">
            {member.age} · {member.hometown} · Code {member.connectionCode}
          </p>
        </div>
        <span className="rounded-full bg-success-soft px-4 py-2 text-base text-success">
          🟢 Connected
        </span>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Today’s overview</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((r) => (
            <div key={r.id} className="card-soft flex items-center gap-3 bg-card p-4">
              <span className="text-3xl" aria-hidden="true">
                {r.emoji}
              </span>
              <div className="flex-1">
                <p className="text-lg font-medium">{t(r.labelKey)}</p>
                <p className="text-sm text-muted-foreground">{r.time}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  r.done ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"
                }`}
              >
                {r.done ? "Completed" : "Upcoming"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-soft bg-card p-5">
          <h2 className="text-2xl font-semibold">AI activity insight</h2>
          <ul className="mt-3 space-y-2">
            {insights.map((i) => (
              <li key={i.label} className="flex items-center justify-between text-lg">
                <span>{i.label}</span>
                <span className="font-medium text-primary">{i.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            AI-generated activity insight — not a medical diagnosis.
          </p>
        </div>

        <div className="card-soft bg-accent-soft p-5">
          <h2 className="text-2xl font-semibold">Recommended next</h2>
          <p className="mt-2 text-xl font-medium">{rec.title}</p>
          <p className="text-lg text-muted-foreground">{rec.reason}</p>
          <p className="mt-4 text-base">Preferred theme: {rec.theme}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Recent notices</h2>
        <div className="mt-3 space-y-3">
          {alerts
            .filter((a) => a.memberId === member.id)
            .map((a) => (
              <div key={a.id} className="card-soft flex items-start gap-3 bg-card p-4">
                <span className="text-2xl" aria-hidden="true">
                  {a.emoji}
                </span>
                <div>
                  <p className="text-lg font-medium">{t(a.titleKey)}</p>
                  <p className="text-base text-muted-foreground">{a.detail}</p>
                  <p className="text-sm text-muted-foreground">{a.when}</p>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { alerts, gameSessions, members, notes } from "@/lib/silirual/demo-data";

export const Route = createFileRoute("/care/")({
  component: CareDashboard,
});

function CareDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Good morning, Dr. Sharma</h1>
        <p className="text-lg text-muted-foreground">
          Authorised members only. Access is granted by the member or their guardian.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {members.map((m) => {
          const sessions = gameSessions.filter((s) => s.memberId === m.id);
          const memberNotes = notes.filter((n) => n.memberId === m.id);
          return (
            <section key={m.id} className="card-soft bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-2xl font-semibold">{m.name}</p>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    m.status === "active"
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning-foreground"
                  }`}
                >
                  {m.status === "active" ? "Active" : "Needs attention"}
                </span>
              </div>
              <p className="text-base text-muted-foreground">
                {m.age} · {m.region}
              </p>
              <dl className="mt-3 space-y-1 text-base">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Recent sessions</dt>
                  <dd>{sessions.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Average accuracy</dt>
                  <dd>
                    {sessions.length
                      ? Math.round(
                          sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length,
                        ) + "%"
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Open notices</dt>
                  <dd>{alerts.filter((a) => a.memberId === m.id).length}</dd>
                </div>
              </dl>
              {memberNotes[0] ? (
                <p className="mt-3 rounded-2xl bg-secondary p-3 text-base">
                  “{memberNotes[0].note}”
                </p>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

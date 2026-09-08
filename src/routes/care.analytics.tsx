import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { gameSessions as demoSessions, weekProgress } from "@/lib/silirual/demo-data";
import { insightsFor, recommendation } from "@/lib/silirual/ai-engine";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/care/analytics")({
  component: Analytics,
});

function Analytics() {
  const { gameSessions: liveSessions, t } = useSilirual();
  const allSessions = [...liveSessions, ...demoSessions];
  
  const accuracy = allSessions.map((s) => ({
    label: `${s.gameId} L${s.level}`,
    accuracy: s.accuracy,
    response: Number((s.responseMs / 1000).toFixed(1)),
  }));
  const insights = insightsFor("m1", liveSessions);
  const rec = recommendation("m1");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-lg text-muted-foreground">
          Asha · authorised view of observed activity data
        </p>
      </div>

      {/* Observed Data Section */}
      <div className="rounded-3xl border-2 border-border p-6 bg-card/50">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{t("care.observed")}</h2>
        
        <div className="grid gap-6">
          <section className="card-soft bg-card p-5 border border-border/50">
            <h3 className="text-xl font-semibold">Activity Accuracy & Response</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracy.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="var(--color-chart-1)" radius={6} />
                  <Bar dataKey="response" name="Response (s)" fill="var(--color-chart-2)" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card-soft bg-card p-5 border border-border/50">
            <h3 className="text-xl font-semibold">Engagement & adherence trend</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="adherence"
                    name="Reminder adherence %"
                    stroke="var(--color-chart-3)"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="memories"
                    name="Memory activities"
                    stroke="var(--color-chart-4)"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="rounded-3xl border-2 border-primary/30 bg-primary-soft/30 p-6 mt-4">
        <h2 className="text-2xl font-bold mb-2 text-primary">{t("care.aiInsight")}</h2>
        <p className="text-base text-muted-foreground mb-6 font-medium">
          {t("care.notDiagnosis")}
        </p>
        
        <section className="card-soft bg-card p-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            {insights.map((i) => (
              <li key={i.label} className="flex justify-between rounded-2xl bg-secondary/50 px-5 py-3 text-lg border border-border/50">
                <span className="text-foreground">{i.label}</span>
                <span className="font-semibold text-primary">{i.value}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 p-4 bg-accent-soft rounded-2xl border border-accent/20">
            <h3 className="font-semibold text-lg mb-1">Recommended Next Activity</h3>
            <p className="text-lg">
              <strong>{rec.title}</strong> — {rec.reason}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

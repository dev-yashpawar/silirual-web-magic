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
import { gameSessions, weekProgress } from "@/lib/silirual/demo-data";
import { insightsFor, recommendation } from "@/lib/silirual/ai-engine";

export const Route = createFileRoute("/care/analytics")({
  component: Analytics,
});

function Analytics() {
  const accuracy = gameSessions.map((s) => ({
    label: `${s.gameId} L${s.level}`,
    accuracy: s.accuracy,
    response: Number((s.responseMs / 1000).toFixed(1)),
  }));
  const insights = insightsFor("m1");
  const rec = recommendation("m1");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-lg text-muted-foreground">
          Asha · authorised view of observed activity data
        </p>
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Observed activity data</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={accuracy}>
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

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Engagement & adherence trend</h2>
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

      <section className="card-soft bg-accent-soft p-5">
        <h2 className="text-2xl font-semibold">AI-generated activity insights</h2>
        <p className="text-base text-muted-foreground">
          Kept separate from observed data. Not a medical diagnosis.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {insights.map((i) => (
            <li key={i.label} className="flex justify-between rounded-2xl bg-card px-4 py-2 text-lg">
              <span>{i.label}</span>
              <span className="font-medium text-primary">{i.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg">
          Suggested activity: <strong>{rec.title}</strong> — {rec.reason}
        </p>
      </section>
    </div>
  );
}

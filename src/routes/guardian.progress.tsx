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

export const Route = createFileRoute("/guardian/progress")({
  component: Progress,
});

function Progress() {
  const sessions = gameSessions.filter((s) => s.memberId === "m1");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Progress</h1>
        <p className="text-lg text-muted-foreground">
          A gentle picture of participation this week — activity patterns, not medical measures.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Activities this week", "17"],
          ["Memories viewed", "23"],
          ["Reminder adherence", "88%"],
          ["Water glasses / day", "4.0"],
        ].map(([label, value]) => (
          <div key={label} className="card-soft bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-3xl font-semibold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Daily activity</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip />
              <Bar dataKey="games" name="Activities" fill="var(--color-chart-1)" radius={6} />
              <Bar dataKey="memories" name="Memories" fill="var(--color-chart-2)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Reminder adherence</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="adherence"
                name="Adherence %"
                stroke="var(--color-chart-3)"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Recent activity sessions</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Activity</th>
                <th className="py-2 pr-4">Level</th>
                <th className="py-2 pr-4">Accuracy</th>
                <th className="py-2">Response</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2 pr-4">{s.date}</td>
                  <td className="py-2 pr-4 capitalize">{s.gameId}</td>
                  <td className="py-2 pr-4">{s.level}</td>
                  <td className="py-2 pr-4">{s.accuracy}%</td>
                  <td className="py-2">{(s.responseMs / 1000).toFixed(1)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

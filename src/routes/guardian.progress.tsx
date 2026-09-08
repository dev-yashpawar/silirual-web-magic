import { useState } from "react";
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
import { useSilirual } from "@/lib/silirual/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guardian/progress")({
  component: Progress,
});

function Progress() {
  const { gameSessions: liveSessions } = useSilirual();
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");
  
  const allSessions = [...liveSessions, ...demoSessions.filter((s) => s.memberId === "m1")];
  
  // Stats
  const totalGames = allSessions.length;
  const avgAccuracy = totalGames > 0 ? Math.round(allSessions.reduce((acc, s) => acc + s.accuracy, 0) / totalGames) : 0;
  const avgResponse = totalGames > 0 ? (allSessions.reduce((acc, s) => acc + s.responseMs, 0) / totalGames / 1000).toFixed(1) : "0.0";
  const recentGames = allSessions.slice(0, 5);

  const dailyData = [
    { time: "9 AM", games: 1, memories: 2, adherence: 100 },
    { time: "12 PM", games: 2, memories: 1, adherence: 80 },
    { time: "3 PM", games: 0, memories: 3, adherence: 90 },
    { time: "6 PM", games: 1, memories: 0, adherence: 100 },
  ];

  const chartData = viewMode === "weekly" ? weekProgress : dailyData;
  const xAxisKey = viewMode === "weekly" ? "day" : "time";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Progress</h1>
        <p className="text-lg text-muted-foreground">
          A gentle picture of participation — activity patterns, not medical measures.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Total Activities", String(totalGames)],
          ["Average Accuracy", `${avgAccuracy}%`],
          ["Avg Response Time", `${avgResponse}s`],
          ["Reminder adherence", "88%"],
        ].map(([label, value]) => (
          <div key={label} className="card-soft bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-3xl font-semibold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-2">
        <Button 
          variant={viewMode === "weekly" ? "gentle" : "calm"} 
          size="calm"
          onClick={() => setViewMode("weekly")}
        >
          Weekly View
        </Button>
        <Button 
          variant={viewMode === "daily" ? "gentle" : "calm"} 
          size="calm"
          onClick={() => setViewMode("daily")}
        >
          Daily View
        </Button>
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Activity Overview</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey={xAxisKey} stroke="var(--color-muted-foreground)" />
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
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey={xAxisKey} stroke="var(--color-muted-foreground)" />
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
              {recentGames.map((s, i) => (
                <tr key={s.id || i} className="border-t border-border">
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

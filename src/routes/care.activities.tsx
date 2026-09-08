import { createFileRoute } from "@tanstack/react-router";
import { gameSessions, members } from "@/lib/silirual/demo-data";

export const Route = createFileRoute("/care/activities")({
  component: Activities,
});

function memberName(id: string) {
  return members.find((m) => m.id === id)?.name ?? id;
}



function Activities() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Activities</h1>
        <p className="text-lg text-muted-foreground">
          Session-level participation record for authorised members.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-base">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Member</th>
              <th className="py-2 pr-4">Activity</th>
              <th className="py-2 pr-4">Level</th>
              <th className="py-2 pr-4">Accuracy</th>
              <th className="py-2 pr-4">Response</th>
              <th className="py-2 pr-4">Attempts</th>
              <th className="py-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {gameSessions.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="py-3 pr-4">{s.date}</td>
                <td className="py-3 pr-4 font-medium">{memberName(s.memberId)}</td>
                <td className="py-3 pr-4 capitalize">{s.gameId}</td>
                <td className="py-3 pr-4">{s.level}</td>
                <td className="py-3 pr-4">{s.accuracy}%</td>
                <td className="py-3 pr-4">{(s.responseMs / 1000).toFixed(1)}s</td>
                <td className="py-3 pr-4">{s.attempts}</td>
                <td className="py-3">{s.completed ? "Yes" : "Partial"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        Difficulty adapts gradually: strong performance raises the level by one step, and a
        difficult session holds or lowers it.
      </p>
    </div>
  );
}

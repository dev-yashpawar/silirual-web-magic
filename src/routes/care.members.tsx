import { createFileRoute } from "@tanstack/react-router";
import { gameSessions, members, professionals } from "@/lib/silirual/demo-data";

export const Route = createFileRoute("/care/members")({
  component: CareMembers,
});

function CareMembers() {
  const me = professionals[0]!;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Members</h1>
        <p className="text-lg text-muted-foreground">
          {me.name} · {me.kind} · access approved for {me.memberIds.length} members
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-base">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-2 pr-4">Member</th>
              <th className="py-2 pr-4">Region</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Sessions</th>
              <th className="py-2 pr-4">Highest level</th>
              <th className="py-2">Access</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const sessions = gameSessions.filter((s) => s.memberId === m.id);
              const top = sessions.reduce((a, s) => Math.max(a, s.level), 0);
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="py-3 pr-4 font-medium">{m.name}</td>
                  <td className="py-3 pr-4">{m.region}</td>
                  <td className="py-3 pr-4">
                    {m.status === "active" ? "Active" : "Needs attention"}
                  </td>
                  <td className="py-3 pr-4">{sessions.length}</td>
                  <td className="py-3 pr-4">{top || "—"}</td>
                  <td className="py-3">
                    {me.memberIds.includes(m.id) ? "Approved · 30 days" : "Not authorised"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Request access to a member</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Enter a member connection code or send an access request. The member or their guardian
          approves the request, chooses which information is shared, and sets how long access lasts.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-base">
          <li>Activity history</li>
          <li>Cognitive activity trends</li>
          <li>Reminder adherence</li>
          <li>Alerts</li>
        </ul>
      </section>
    </div>
  );
}

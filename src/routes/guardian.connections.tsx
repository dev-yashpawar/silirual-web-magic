import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connections as seed, members } from "@/lib/silirual/demo-data";
import type { Connection } from "@/lib/silirual/types";

export const Route = createFileRoute("/guardian/connections")({
  component: Connections,
});

function Connections() {
  const member = members[0]!;
  const [list, setList] = useState<Connection[]>(seed);
  const [code, setCode] = useState("");

  const request = () => {
    if (code.trim().toUpperCase() !== member.connectionCode) {
      toast.error("That code does not match a member. Please check and try again.");
      return;
    }
    setList([
      {
        id: `c-${Date.now()}`,
        memberId: member.id,
        personName: "Anita",
        personRole: "guardian",
        relation: "Daughter",
        status: "pending",
        permissions: ["View daily activity", "View progress", "Manage reminders"],
      },
      ...list,
    ]);
    setCode("");
    toast.success("Request sent. The member must approve it before anything is shared.");
  };

  const decide = (id: string, status: Connection["status"]) => {
    setList(list.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success(status === "connected" ? "Connected." : "Request declined.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Connections</h1>
        <p className="text-lg text-muted-foreground">
          Connecting never grants full access on its own — each permission is approved separately.
        </p>
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Connect a member</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="code">Enter connection code</Label>
            <Input
              id="code"
              placeholder="SL-4827-AX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-56"
            />
          </div>
          <Button variant="gentle" size="calm" onClick={request}>
            Send request
          </Button>
          <Button
            variant="calm"
            size="calm"
            onClick={() => toast.info("Point the camera at the member’s QR code on their profile.")}
          >
            Scan QR code
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Demo code for this build: {member.connectionCode}
        </p>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">People connected to {member.name}</h2>
        <div className="mt-3 grid gap-3">
          {list.map((c) => (
            <div key={c.id} className="rounded-2xl bg-secondary p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-medium">{c.personName}</p>
                <span className="text-base text-muted-foreground">{c.relation}</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    c.status === "connected"
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning-foreground"
                  }`}
                >
                  {c.status === "connected" ? "🟢 Connected" : "Awaiting approval"}
                </span>
                {c.durationDays ? (
                  <span className="text-sm text-muted-foreground">
                    Access duration: {c.durationDays} days
                  </span>
                ) : null}
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {c.permissions.map((p) => (
                  <li key={p} className="rounded-full bg-card px-3 py-1 text-sm">
                    {p}
                  </li>
                ))}
              </ul>
              {c.status === "pending" ? (
                <div className="mt-3 flex gap-3">
                  <Button variant="gentle" size="calm" onClick={() => decide(c.id, "connected")}>
                    Approve
                  </Button>
                  <Button variant="calm" size="calm" onClick={() => decide(c.id, "expired")}>
                    Decline
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Personal photos and family stories need their own permission and are never shared
        automatically.
      </p>
    </div>
  );
}

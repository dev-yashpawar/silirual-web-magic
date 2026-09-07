import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { connections as seed, members, guardians } from "@/lib/silirual/demo-data";
import type { Connection } from "@/lib/silirual/types";

export const Route = createFileRoute("/guardian/connections")({
  component: Connections,
});

function Connections() {
  const member = members[0]!;
  const [list, setList] = useState<Connection[]>(seed.filter(c => c.memberId === member.id));
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

  const memberGuardians = guardians.filter(g => g.memberId === member.id);

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
        
        <div className="mt-4 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="grid gap-2">
              <Label htmlFor="code">Enter connection code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="SL-4827-AX"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-48 text-lg"
                />
                <Button variant="gentle" size="calm" onClick={request}>
                  Send request
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Demo code for this build: {member.connectionCode}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary p-4">
            <p className="text-sm font-medium">Scan QR code</p>
            <div className="bg-white p-2 rounded-xl">
              <svg width="96" height="96" viewBox="0 0 4 4" className="fill-black">
                <path d="M0,0 h1 v1 h-1 z M3,0 h1 v1 h-1 z M0,3 h1 v1 h-1 z M1,1 h2 v1 h-2 z M2,2 h1 v2 h-1 z M1,3 h1 v1 h-1 z" />
              </svg>
            </div>
            <Button
              variant="calm"
              size="calm"
              onClick={() => toast.info("Point the camera at the member’s QR code on their profile.")}
            >
              Scan with Camera
            </Button>
          </div>
        </div>
      </section>

      {list.filter(c => c.status === "pending").length > 0 && (
        <section className="card-soft bg-primary-soft p-5 border-2 border-primary">
          <h2 className="text-2xl font-semibold">Pending Requests</h2>
          <div className="mt-3 grid gap-3">
            {list.filter(c => c.status === "pending").map((c) => (
              <div key={c.id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-medium">{c.personName}</p>
                  <span className="text-base text-muted-foreground">({c.relation})</span>
                  <Badge variant="outline" className="bg-warning-soft text-warning-foreground border-warning">
                    Awaiting approval
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Requested permissions:</p>
                  <ul className="flex flex-wrap gap-2">
                    {c.permissions.map((p) => (
                      <li key={p} className="rounded-full bg-secondary px-3 py-1 text-sm">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button variant="gentle" size="calm" onClick={() => decide(c.id, "connected")}>
                    Approve
                  </Button>
                  <Button variant="calm" size="calm" onClick={() => decide(c.id, "expired")}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Active Guardians for {member.name}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {memberGuardians.map((g) => (
            <div key={g.id} className="rounded-2xl bg-secondary p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                {g.name[0]}
              </div>
              <div>
                <p className="text-lg font-medium">{g.name}</p>
                <p className="text-sm text-muted-foreground">{g.relation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Other Connections</h2>
        <div className="mt-3 grid gap-3">
          {list.filter(c => c.status === "connected").map((c) => (
            <div key={c.id} className="rounded-2xl bg-secondary p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-medium">{c.personName}</p>
                <span className="text-base text-muted-foreground">{c.relation}</span>
                <span className="rounded-full px-3 py-1 text-sm bg-success-soft text-success">
                  🟢 Connected
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

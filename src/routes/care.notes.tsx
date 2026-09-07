import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { members, notes as seed } from "@/lib/silirual/demo-data";
import type { ProfessionalNote } from "@/lib/silirual/types";

export const Route = createFileRoute("/care/notes")({
  component: Notes,
});

function Notes() {
  const [list, setList] = useState<ProfessionalNote[]>(seed);
  const [form, setForm] = useState({ memberId: "m1", activity: "", note: "", followUp: "" });

  const add = () => {
    if (!form.note.trim()) {
      toast.error("Please write the observation first.");
      return;
    }
    setList([
      {
        id: `n-${Date.now()}`,
        memberId: form.memberId,
        author: "Dr. Sharma",
        date: new Date().toISOString().slice(0, 10),
        activity: form.activity || "General observation",
        note: form.note,
        followUp: form.followUp,
      },
      ...list,
    ]);
    setForm({ memberId: form.memberId, activity: "", note: "", followUp: "" });
    toast.success("Observation saved.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Notes</h1>
        <p className="text-lg text-muted-foreground">
          Professional observations about participation and engagement.
        </p>
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Add an observation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="note-member">Member</Label>
            <select
              id="note-member"
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="h-11 rounded-md border border-input bg-background px-3 text-base"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note-activity">Activity</Label>
            <Input
              id="note-activity"
              value={form.activity}
              onChange={(e) => setForm({ ...form, activity: e.target.value })}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="note-body">Observation</Label>
            <Textarea
              id="note-body"
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="note-follow">Follow-up suggestion</Label>
            <Input
              id="note-follow"
              value={form.followUp}
              onChange={(e) => setForm({ ...form, followUp: e.target.value })}
            />
          </div>
        </div>
        <Button variant="gentle" size="calm" className="mt-4" onClick={add}>
          Save observation
        </Button>
      </section>

      <div className="grid gap-3">
        {list.map((n) => (
          <div key={n.id} className="card-soft bg-card p-5">
            <p className="text-sm text-muted-foreground">
              {n.date} · {members.find((m) => m.id === n.memberId)?.name} · {n.author}
            </p>
            <p className="mt-1 text-lg font-medium">{n.activity}</p>
            <p className="mt-1 text-lg">{n.note}</p>
            {n.followUp ? (
              <p className="mt-2 rounded-2xl bg-secondary p-3 text-base">
                Follow-up: {n.followUp}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

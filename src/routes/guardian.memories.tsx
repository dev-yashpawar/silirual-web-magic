import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { albums, memories as seedMemories } from "@/lib/silirual/demo-data";
import type { Memory } from "@/lib/silirual/types";

export const Route = createFileRoute("/guardian/memories")({
  component: GuardianMemories,
});

function GuardianMemories() {
  const [items, setItems] = useState<Memory[]>(seedMemories.filter((m) => m.memberId === "m1"));
  const [form, setForm] = useState({
    title: "",
    people: "",
    place: "",
    year: "",
    occasion: "",
    story: "",
    offline: true,
  });

  const add = () => {
    if (!form.title.trim()) {
      toast.error("Please give the memory a short title.");
      return;
    }
    const memory: Memory = {
      id: `me-${Date.now()}`,
      memberId: "m1",
      title: form.title,
      people: form.people || "Family",
      place: form.place || "Home",
      year: Number(form.year) || new Date().getFullYear(),
      occasion: form.occasion || "Everyday life",
      story: form.story,
      theme: "family",
      emoji: "📷",
      offline: form.offline,
    };
    setItems([memory, ...items]);
    setForm({ title: "", people: "", place: "", year: "", occasion: "", story: "", offline: true });
    toast.success("Memory added to Asha’s memory bank.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Memories</h1>
        <p className="text-lg text-muted-foreground">
          Add photos, people, places and stories that Asha loves. These shape the memories she sees.
        </p>
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Albums</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {albums.map((a) => (
            <div key={a.id} className="rounded-2xl bg-secondary p-4">
              <p className="text-3xl" aria-hidden="true">
                {a.emoji}
              </p>
              <p className="text-lg font-medium">{a.title}</p>
              <p className="text-sm text-muted-foreground">{a.count} photos</p>
              <p className="mt-2 text-sm">
                {a.offline ? "✅ Available offline" : "Online only"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Add a memory</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["title", "Title"],
              ["people", "People"],
              ["place", "Place"],
              ["year", "Year"],
              ["occasion", "Occasion"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="grid gap-2">
              <Label htmlFor={`field-${key}`}>{label}</Label>
              <Input
                id={`field-${key}`}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="field-story">Story</Label>
            <Textarea
              id="field-story"
              rows={3}
              value={form.story}
              onChange={(e) => setForm({ ...form, story: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="field-offline"
              checked={form.offline}
              onCheckedChange={(v) => setForm({ ...form, offline: v })}
            />
            <Label htmlFor="field-offline">Available offline</Label>
          </div>
        </div>
        <Button variant="gentle" size="calm" className="mt-4" onClick={add}>
          Add memory
        </Button>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Memory bank</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-2xl bg-secondary p-4">
              <p className="text-3xl" aria-hidden="true">
                {m.emoji}
              </p>
              <p className="text-lg font-medium">{m.title}</p>
              <p className="text-sm text-muted-foreground">
                {m.people} · {m.place} · {m.year}
              </p>
              <p className="mt-2 text-base">{m.story}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

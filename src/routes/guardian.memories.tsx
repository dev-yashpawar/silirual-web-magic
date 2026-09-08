import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { albums as seedAlbums, memories as seedMemories } from "@/lib/silirual/demo-data";
import type { Memory, MemoryAlbum } from "@/lib/silirual/types";

export const Route = createFileRoute("/guardian/memories")({
  component: GuardianMemories,
});

function GuardianMemories() {
  const [items, setItems] = useState<Memory[]>(seedMemories.filter((m) => m.memberId === "m1"));
  const [compilations, setCompilations] = useState<MemoryAlbum[]>(seedAlbums);
  
  const [form, setForm] = useState({
    title: "",
    people: "",
    place: "",
    year: "",
    occasion: "",
    story: "",
    offline: true,
  });

  const [compForm, setCompForm] = useState({
    title: "",
    description: "",
    selectedMemories: [] as string[],
    offline: true
  });

  const addMemory = () => {
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

  const addCompilation = () => {
    if (!compForm.title.trim()) {
      toast.error("Please give the compilation a title.");
      return;
    }
    const newComp: MemoryAlbum = {
      id: `al-${Date.now()}`,
      title: compForm.title,
      count: compForm.selectedMemories.length,
      emoji: "🗂️",
      offline: compForm.offline
    };
    setCompilations([newComp, ...compilations]);
    setCompForm({ title: "", description: "", selectedMemories: [], offline: true });
    toast.success("Memory compilation created.");
  };

  const toggleMemoryOffline = (id: string, offline: boolean) => {
    setItems(items.map(m => m.id === id ? { ...m, offline } : m));
    toast.success(`Memory is now ${offline ? 'available offline' : 'online only'}`);
  };

  const toggleAlbumOffline = (id: string, offline: boolean) => {
    setCompilations(compilations.map(a => a.id === id ? { ...a, offline } : a));
    toast.success(`Album is now ${offline ? 'available offline' : 'online only'}`);
  };

  const toggleMemorySelection = (id: string) => {
    const selected = compForm.selectedMemories.includes(id)
      ? compForm.selectedMemories.filter(mId => mId !== id)
      : [...compForm.selectedMemories, id];
    setCompForm({ ...compForm, selectedMemories: selected });
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
          {compilations.map((a) => (
            <div key={a.id} className="rounded-2xl bg-secondary p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <p className="text-3xl" aria-hidden="true">{a.emoji}</p>
                  <Badge variant={a.offline ? "default" : "secondary"}>
                    {a.offline ? "Offline" : "Online"}
                  </Badge>
                </div>
                <p className="text-lg font-medium mt-2">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.count} photos</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Switch 
                  id={`album-off-${a.id}`} 
                  checked={a.offline} 
                  onCheckedChange={(v) => toggleAlbumOffline(a.id, v)} 
                />
                <Label htmlFor={`album-off-${a.id}`} className="text-sm">Available offline</Label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
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
                  value={(form as any)[key]}
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
          <Button variant="gentle" size="calm" className="mt-4" onClick={addMemory}>
            Add memory
          </Button>
        </section>

        <section className="card-soft bg-primary-soft p-5 border-2 border-primary">
          <h2 className="text-2xl font-semibold">Create Compilation</h2>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="comp-title">Compilation Title</Label>
              <Input
                id="comp-title"
                value={compForm.title}
                onChange={(e) => setCompForm({ ...compForm, title: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Select Memories ({compForm.selectedMemories.length} selected)</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-md bg-card">
                {items.map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id={`select-${m.id}`}
                      checked={compForm.selectedMemories.includes(m.id)}
                      onChange={() => toggleMemorySelection(m.id)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`select-${m.id}`} className="flex-1 cursor-pointer">
                      {m.emoji} {m.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="comp-offline"
                checked={compForm.offline}
                onCheckedChange={(v) => setCompForm({ ...compForm, offline: v })}
              />
              <Label htmlFor="comp-offline">Available offline</Label>
            </div>
            
            <Button variant="gentle" size="calm" onClick={addCompilation}>
              Save Compilation
            </Button>
          </div>
        </section>
      </div>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Memory bank</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-2xl bg-secondary p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between">
                  <p className="text-3xl" aria-hidden="true">{m.emoji}</p>
                  <Badge variant={m.offline ? "default" : "secondary"}>
                    {m.offline ? "Offline" : "Online"}
                  </Badge>
                </div>
                <p className="text-lg font-medium mt-2">{m.title}</p>
                <p className="text-sm text-muted-foreground">
                  {m.people} · {m.place} · {m.year}
                </p>
                <p className="mt-2 text-base">{m.story}</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Switch 
                  id={`mem-off-${m.id}`} 
                  checked={m.offline} 
                  onCheckedChange={(v) => toggleMemoryOffline(m.id, v)} 
                />
                <Label htmlFor={`mem-off-${m.id}`} className="text-sm">Available offline</Label>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

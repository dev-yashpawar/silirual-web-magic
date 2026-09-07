import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/silirual/speak-button";
import { albums, memories, rootsCards } from "@/lib/silirual/demo-data";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/member/memories")({
  head: () => ({
    meta: [
      { title: "My Memories — SILIRUAL" },
      {
        name: "description",
        content:
          "Family photos, festival days and memories from home, gathered gently to encourage meaningful reminiscence.",
      },
      { property: "og:title", content: "My Memories — SILIRUAL" },
      {
        property: "og:description",
        content: "Family moments, festival days and memories from home in one gentle place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyMemories,
});

const LANE = [
  "3 Years Ago Today",
  "A Memory From Your Journey",
  "A Special Day",
  "People Who Matter",
  "Memories From Home",
  "Festival Memories",
];

function MyMemories() {
  const { t, member, speak, buzz } = useSilirual();
  const mine = memories.filter((m) => m.memberId === member.id);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showRoots, setShowRoots] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-3xl font-semibold">{t("nav.memories")}</h1>
        <SpeakButton text={t("nav.memories")} />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {LANE.map((label) => (
          <span
            key={label}
            className="shrink-0 rounded-full bg-accent-soft px-4 py-2 text-lg text-accent-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-muted-foreground">Albums</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {albums
          .filter((a) => a.memberId === member.id)
          .map((a) => (
            <div key={a.id} className="card-soft flex items-center gap-4 bg-card p-5">
              <span className="text-4xl" aria-hidden="true">
                {a.emoji}
              </span>
              <div className="flex-1">
                <p className="text-xl font-semibold">{a.title}</p>
                <p className="text-base text-muted-foreground">{a.count} photos</p>
              </div>
              {a.offline ? (
                <span className="rounded-full bg-success-soft px-3 py-1 text-sm text-success">
                  Always available
                </span>
              ) : null}
            </div>
          ))}
      </div>

      <h2 className="mt-2 text-2xl font-semibold text-muted-foreground">
        {t("memory.doYouRemember")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {mine.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              buzz(14);
              setOpenId(openId === m.id ? null : m.id);
              speak(`${m.title}. ${m.story}`);
            }}
            className="card-soft gentle-in flex flex-col items-start gap-2 bg-card p-5 text-left"
          >
            <span className="flex h-32 w-full items-center justify-center rounded-2xl bg-accent-soft text-6xl">
              <span aria-hidden="true">{m.emoji}</span>
            </span>
            <span className="text-xl font-semibold">{m.title}</span>
            <span className="text-base text-muted-foreground">
              {m.people} · {m.place} · {m.year}
            </span>
            {openId === m.id ? <span className="text-lg">{m.story}</span> : null}
          </button>
        ))}
      </div>

      <Button
        variant="calm"
        size="big"
        className="mt-2"
        onClick={() => {
          buzz(14);
          setShowRoots((s) => !s);
        }}
      >
        🌄 {t("nav.roots")}
      </Button>

      {showRoots ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {rootsCards.map((c) => (
            <div key={c.key} className="card-soft flex items-start gap-4 bg-secondary p-5">
              <span className="text-4xl" aria-hidden="true">
                {c.emoji}
              </span>
              <div>
                <p className="text-xl font-semibold">{c.title}</p>
                <p className="text-lg text-muted-foreground">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

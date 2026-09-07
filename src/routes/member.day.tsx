import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/silirual/speak-button";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/member/day")({
  head: () => ({
    meta: [
      { title: "My Day — SILIRUAL" },
      {
        name: "description",
        content:
          "A simple picture of the day: medicine, water, meals, a gentle walk and a memory activity, with voice and vibration support.",
      },
      { property: "og:title", content: "My Day — SILIRUAL" },
      {
        property: "og:description",
        content: "Medicine, water, meals and a gentle walk, one clear step at a time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyDay,
});

function MyDay() {
  const { t, reminders, toggleReminder, buzz, speak } = useSilirual();
  const done = reminders.filter((r) => r.done).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-3xl font-semibold">{t("nav.day")}</h1>
        <SpeakButton text={t("nav.day")} />
      </div>

      <p className="rounded-2xl bg-success-soft p-4 text-lg text-success">
        {done} of {reminders.length} things done today.
      </p>

      {reminders.map((r) => (
        <section
          key={r.id}
          className={`card-soft gentle-in flex flex-wrap items-center gap-4 p-5 ${
            r.done ? "bg-success-soft" : r.priority === "high" ? "bg-warning-soft" : "bg-card"
          }`}
        >
          <span className="text-4xl" aria-hidden="true">
            {r.emoji}
          </span>
          <div className="min-w-40 flex-1">
            <h2 className="text-2xl font-semibold">{t(r.labelKey)}</h2>
            <p className="text-lg text-muted-foreground">{r.time}</p>
          </div>
          <SpeakButton text={`${t(r.labelKey)} at ${r.time}`} />
          <div className="flex flex-wrap gap-3">
            <Button
              variant={r.done ? "calm" : "gentle"}
              size="big"
              onClick={() => {
                buzz([20, 60, 20]);
                toggleReminder(r.id);
                if (!r.done) speak(t("common.done"));
              }}
            >
              {r.done ? "✓ " + t("common.done") : t("common.done")}
            </Button>
            {!r.done ? (
              <Button variant="calm" size="big" onClick={() => buzz(12)}>
                {t("common.later")}
              </Button>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

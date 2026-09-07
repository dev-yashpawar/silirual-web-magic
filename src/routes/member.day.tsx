import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/silirual/speak-button";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/member/day")({
  head: () => ({
    meta: [
      { title: "My Day — CiliRual" },
      {
        name: "description",
        content:
          "A simple picture of the day: medicine, water, meals, a gentle walk and a memory activity, with voice and vibration support.",
      },
      { property: "og:title", content: "My Day — CiliRual" },
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
  const { t, reminders, toggleReminder, snoozeReminder, buzz, speak, hydrationCount, hydrationGoal, incrementHydration } = useSilirual();
  const done = reminders.filter((r) => r.done).length;
  const allDone = done === reminders.length;
  const progress = Math.round((done / (reminders.length || 1)) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-3xl font-semibold">{t("nav.day")}</h1>
        <SpeakButton text={t("nav.day")} />
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-success-soft p-4">
        <p className="text-lg text-success font-medium">
          {done} of {reminders.length} things done today.
        </p>
        <div className="h-3 w-full rounded-full bg-success/20 overflow-hidden">
          <div className="h-full bg-success transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      {allDone && (
        <div className="rounded-2xl bg-primary-soft p-6 text-center text-primary text-xl font-semibold gentle-in">
          🌟 {t("reminders.allDone")} 🌟
        </div>
      )}
      
      <section className="card-soft gentle-in flex flex-col gap-4 p-5 bg-card">
        <div className="flex items-center gap-4">
            <span className="text-4xl" aria-hidden="true">💧</span>
            <div className="min-w-40 flex-1">
              <h2 className="text-2xl font-semibold">Water</h2>
              <p className="text-lg text-muted-foreground">{hydrationCount} of {hydrationGoal} glasses</p>
            </div>
            <SpeakButton text={`Water. ${hydrationCount} of ${hydrationGoal} glasses`} />
        </div>
        <div className="flex gap-2">
            {Array.from({ length: hydrationGoal }).map((_, i) => (
                <span key={i} className={`text-3xl ${i < hydrationCount ? "opacity-100" : "opacity-30 grayscale"}`}>
                    💧
                </span>
            ))}
        </div>
        <Button variant="gentle" size="big" onClick={() => {
            buzz(20);
            incrementHydration();
            speak(t("common.done"));
        }} disabled={hydrationCount >= hydrationGoal}>
            Mark Done
        </Button>
      </section>

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
              <Button variant="calm" size="big" onClick={() => {
                  buzz(12);
                  snoozeReminder(r.id);
                  speak(t("common.later"));
              }}>
                {t("common.later")}
              </Button>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

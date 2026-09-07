import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { BigCard } from "@/components/silirual/big-card";
import { SpeakButton } from "@/components/silirual/speak-button";
import { VoiceAssistant } from "@/components/silirual/voice-assistant";
import { memoryOfTheDay } from "@/lib/silirual/ai-engine";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/member/")({
  component: MySpace,
});



function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "common.greeting.morning";
  if (hour < 17) return "common.greeting.afternoon";
  return "common.greeting.evening";
}

function MySpace() {
  const { t, member, reminders, toggleReminder, buzz, speak, memoryResponses, answerMemory } =
    useSilirual();
  const memory = memoryOfTheDay(member.id);
  const answered = memoryResponses[memory.id];
  const nextThings = reminders.filter((r) => !r.done).slice(0, 3);
  const water = 3;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-3xl font-semibold">
          {t(greetingKey())}, {member.name} 🌼
        </h1>
        <SpeakButton text={`${t(greetingKey())}, ${member.name}`} />
      </div>

      <VoiceAssistant />

      <h2 className="mt-2 text-2xl font-semibold text-muted-foreground">{t("member.today")}</h2>

      {nextThings.length === 0 ? (
        <BigCard
          emoji="🌟"
          tone="success"
          title={t("reminders.allDone")}
          speakText={t("reminders.allDone")}
        />
      ) : (
        nextThings.map((r) => (
          <BigCard
            key={r.id}
            emoji={r.emoji}
            tone={r.priority === "high" ? "warning" : "plain"}
            title={t(r.labelKey)}
            body={
              r.kind === "medicine"
                ? t("reminders.medicineBody")
                : r.kind === "hydration"
                  ? `You have had ${water} of 5 glasses.`
                  : `At ${r.time}`
            }
            speakText={`${t(r.labelKey)}. ${r.kind === "medicine" ? t("reminders.medicineBody") : ""}`}
            action={
              <>
                <Button
                  variant="gentle"
                  size="big"
                  onClick={() => {
                    buzz([20, 60, 20]);
                    toggleReminder(r.id);
                    speak(t("common.done"));
                  }}
                >
                  {t("common.done")}
                </Button>
                <Button variant="calm" size="big" onClick={() => buzz(12)}>
                  {t("common.later")}
                </Button>
              </>
            }
          />
        ))
      )}

      <BigCard
        emoji="🧠"
        tone="primary"
        title={t("reminders.activity")}
        body="Ready for a little memory exercise?"
        speakText="Ready for a little memory exercise?"
        action={
          <Button variant="gentle" size="big" asChild>
            <Link to="/member/games">{t("common.start")}</Link>
          </Button>
        }
      />

      <section className="card-soft gentle-in p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <h2 className="flex-1 text-2xl font-semibold">📸 {t("member.memoryOfDay")}</h2>
          <SpeakButton text={t("memory.doYouRemember")} />
        </div>
        <div className="mt-4 flex min-h-48 flex-col items-center justify-center rounded-2xl bg-accent-soft p-6 text-center">
          <span className="text-7xl" aria-hidden="true">
            {memory.emoji}
          </span>
          <p className="mt-3 text-xl font-medium">{memory.title}</p>
          <p className="text-lg text-muted-foreground">
            {memory.place} · {memory.year}
          </p>
        </div>
        <p className="mt-4 text-xl font-medium">{t("memory.doYouRemember")}</p>
        {answered ? (
          <p className="mt-3 rounded-2xl bg-success-soft p-4 text-lg text-success">
            {t("memory.thankYou")} {memory.story}
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button
              variant="calm"
              size="big"
              onClick={() => {
                buzz([20, 50, 20]);
                answerMemory(memory.id, "remember");
                speak(t("memory.thankYou"));
              }}
            >
              😊 {t("memory.iRemember")}
            </Button>
            <Button
              variant="calm"
              size="big"
              onClick={() => {
                buzz(14);
                answerMemory(memory.id, "unsure");
                speak(t("memory.thankYou"));
              }}
            >
              🤔 {t("memory.notSure")}
            </Button>
            <Button
              variant="calm"
              size="big"
              onClick={() => {
                buzz(14);
                answerMemory(memory.id, "no");
                speak(t("memory.thankYou"));
              }}
            >
              💛 {t("memory.dontRemember")}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

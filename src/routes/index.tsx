import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { HeartHandshake, Stethoscope, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/silirual/speak-button";
import { LANGUAGES } from "@/lib/silirual/i18n";
import { useSilirual } from "@/lib/silirual/store";
import type { Role } from "@/lib/silirual/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CiliRual — Let’s Remember Together" },
      {
        name: "description",
        content:
          "CiliRual is a gentle companion for cognitive activities, daily routines and meaningful memories, for members, family guardians and care professionals.",
      },
      { property: "og:title", content: "CiliRual — Let’s Remember Together" },
      {
        property: "og:description",
        content:
          "A gentle digital companion for cognitive activities, daily routines and meaningful memories.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const ROLES: { role: Role; icon: typeof UserRound; titleKey: string; descKey: string; to: "/member" | "/guardian" | "/care" }[] = [
  { role: "member", icon: UserRound, titleKey: "onboarding.member", descKey: "onboarding.memberDesc", to: "/member" },
  { role: "guardian", icon: HeartHandshake, titleKey: "onboarding.guardian", descKey: "onboarding.guardianDesc", to: "/guardian" },
  { role: "professional", icon: Stethoscope, titleKey: "onboarding.professional", descKey: "onboarding.professionalDesc", to: "/care" },
];

function Welcome() {
  const { t, setRole, setLanguage, settings, speak, buzz, finishOnboarding, onboarded, role } = useSilirual();
  const [step, setStep] = useState<"language" | "role">("language");
  const navigate = useNavigate();

  if (onboarded) {
    if (role === "member") return <Navigate to="/member" />;
    if (role === "guardian") return <Navigate to="/guardian" />;
    if (role === "professional") return <Navigate to="/care" />;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:py-16">
      <header className="text-center">
        <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">CiliRual</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{t("onboarding.welcome")}</h1>
        <p className="mt-3 text-xl text-primary">{t("app.tagline")}</p>
        <p className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">{t("app.support")}</p>
      </header>

      {step === "language" ? (
        <section className="mt-10">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-semibold">{t("onboarding.language")}</h2>
            <SpeakButton text={t("onboarding.language")} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  buzz(15);
                  setLanguage(lang.code);
                  speak(lang.native);
                }}
                className={`card-soft flex min-h-24 items-center justify-between gap-3 px-6 py-4 text-left transition-transform hover:-translate-y-0.5 ${
                  settings.language === lang.code ? "bg-primary-soft" : "bg-card"
                }`}
              >
                <span>
                  <span className="block text-2xl font-semibold">{lang.native}</span>
                  <span className="text-base text-muted-foreground">{lang.english}</span>
                </span>
                {!lang.speechLikely ? (
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                    {t("voice.fallback")}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <Button
            variant="gentle"
            size="big"
            className="mt-8 w-full"
            onClick={() => {
              buzz(18);
              setStep("role");
            }}
          >
            {t("common.continue")}
          </Button>
        </section>
      ) : (
        <section className="mt-10">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-semibold">{t("onboarding.howUse")}</h2>
            <SpeakButton text={t("onboarding.howUse")} />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {ROLES.map(({ role, icon: Icon, titleKey, descKey, to }) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  buzz(20);
                  setRole(role);
                  finishOnboarding();
                  speak(t(titleKey));
                  void navigate({ to });
                }}
                className="card-soft flex min-h-56 flex-col items-start gap-3 bg-card p-6 text-left transition-transform hover:-translate-y-1"
              >
                <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="size-9" aria-hidden="true" />
                </span>
                <span className="text-2xl font-semibold">{t(titleKey)}</span>
                <span className="text-lg text-muted-foreground">{t(descKey)}</span>
              </button>
            ))}
          </div>
          <Button variant="calm" size="calm" className="mt-8" onClick={() => setStep("language")}>
            {t("common.back")}
          </Button>
        </section>
      )}

      <p className="mt-12 text-center text-base text-muted-foreground">{t("app.disclaimer")}</p>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SpeakButton } from "@/components/silirual/speak-button";
import { connections, familyMembers } from "@/lib/silirual/demo-data";
import { LANGUAGES } from "@/lib/silirual/i18n";
import { useSilirual } from "@/lib/silirual/store";
import type { TextSize } from "@/lib/silirual/types";

export const Route = createFileRoute("/member/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Comfort Settings — SILIRUAL" },
      {
        name: "description",
        content:
          "Choose text size, voice, gentle vibration, reduced motion and language, and see the family and carers who are connected.",
      },
      { property: "og:title", content: "Profile & Comfort Settings — SILIRUAL" },
      {
        property: "og:description",
        content: "Text size, voice, vibration, motion and language — set the way that feels right.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

const SIZES: { value: TextSize; key: string }[] = [
  { value: "normal", key: "profile.normal" },
  { value: "large", key: "profile.large" },
  { value: "xlarge", key: "profile.xlarge" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <span className="text-xl font-medium">{label}</span>
      {children}
    </div>
  );
}

function Profile() {
  const { t, member, settings, updateSettings, setLanguage, buzz, setRole } = useSilirual();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-3xl font-semibold">{t("nav.profile")}</h1>
        <SpeakButton text={t("nav.profile")} />
      </div>

      <section className="card-soft bg-primary-soft p-5">
        <p className="text-2xl font-semibold">
          {member.name}, {member.age}
        </p>
        <p className="text-lg text-muted-foreground">
          {member.hometown} · {member.occupation}
        </p>
        <p className="mt-4 text-lg">{t("profile.connectionCode")}</p>
        <p className="font-display text-3xl font-semibold tracking-wide text-primary">
          {member.connectionCode}
        </p>
        <div className="mt-3 grid grid-cols-6 gap-1" aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={`aspect-square rounded-sm ${
                (i * 7) % 3 === 0 ? "bg-primary" : "bg-primary/20"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          Share this code only with family or carers you trust. They still need your approval.
        </p>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">{t("profile.myFamily")}</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {familyMembers
            .filter((f) => f.memberId === member.id)
            .map((f) => (
              <span
                key={f.id}
                className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-lg"
              >
                <span aria-hidden="true">{f.emoji}</span> {f.name} · {f.relation}
              </span>
            ))}
        </div>
        <h3 className="mt-5 text-xl font-semibold">Who can see my activity</h3>
        <ul className="mt-2 space-y-2 text-lg">
          {connections
            .filter((c) => c.memberId === member.id)
            .map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{c.personName}</span>
                <span className="text-muted-foreground">({c.relation})</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    c.status === "connected"
                      ? "bg-success-soft text-success"
                      : "bg-warning-soft text-warning-foreground"
                  }`}
                >
                  {c.status === "connected" ? "🟢 Connected" : "Waiting for approval"}
                </span>
              </li>
            ))}
        </ul>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">{t("common.settings")}</h2>

        <Row label={t("profile.textSize")}>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <Button
                key={s.value}
                variant={settings.textSize === s.value ? "gentle" : "calm"}
                size="calm"
                onClick={() => {
                  buzz(12);
                  updateSettings({ textSize: s.value });
                }}
              >
                {t(s.key)}
              </Button>
            ))}
          </div>
        </Row>

        <Row label={t("profile.voice")}>
          <Switch
            checked={settings.voice}
            onCheckedChange={(v) => updateSettings({ voice: v })}
            aria-label={t("profile.voice")}
          />
        </Row>

        <Row label={t("profile.voiceSpeed")}>
          <div className="flex gap-2">
            <Button
              variant={settings.voiceSpeed === "slow" ? "gentle" : "calm"}
              size="calm"
              onClick={() => updateSettings({ voiceSpeed: "slow" })}
            >
              {t("profile.slow")}
            </Button>
            <Button
              variant={settings.voiceSpeed === "normal" ? "gentle" : "calm"}
              size="calm"
              onClick={() => updateSettings({ voiceSpeed: "normal" })}
            >
              {t("profile.normal")}
            </Button>
          </div>
        </Row>

        <Row label={t("profile.haptics")}>
          <Switch
            checked={settings.haptics}
            onCheckedChange={(v) => {
              updateSettings({ haptics: v });
              if (v) buzz(20);
            }}
            aria-label={t("profile.haptics")}
          />
        </Row>

        <Row label="Comfortable game speed">
          <Switch
            checked={settings.comfortableSpeed}
            onCheckedChange={(v) => updateSettings({ comfortableSpeed: v })}
            aria-label="Comfortable game speed"
          />
        </Row>

        <Row label={t("profile.reducedMotion")}>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(v) => updateSettings({ reducedMotion: v })}
            aria-label={t("profile.reducedMotion")}
          />
        </Row>

        <Row label={t("profile.language")}>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <Button
                key={l.code}
                variant={settings.language === l.code ? "gentle" : "calm"}
                size="calm"
                onClick={() => {
                  buzz(12);
                  setLanguage(l.code);
                }}
              >
                {l.native}
              </Button>
            ))}
          </div>
        </Row>
      </section>

      <Button variant="calm" size="big" asChild onClick={() => setRole(null)}>
        <Link to="/">{t("profile.switchRole")}</Link>
      </Button>

      <p className="text-base text-muted-foreground">{t("app.disclaimer")}</p>
    </div>
  );
}

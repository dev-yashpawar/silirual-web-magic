import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LANGUAGES } from "@/lib/silirual/i18n";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/guardian/settings")({
  component: GuardianSettings,
});

function GuardianSettings() {
  const { settings, setLanguage, updateSettings } = useSilirual();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Settings</h1>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">My interface language</h2>
        <p className="text-base text-muted-foreground">
          Your language can differ from the member’s. Asha reads SILIRUAL in Assamese.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <Button
              key={l.code}
              variant={settings.language === l.code ? "gentle" : "calm"}
              size="calm"
              onClick={() => setLanguage(l.code)}
            >
              {l.native}
            </Button>
          ))}
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Member comfort settings</h2>
        <div className="mt-3 grid gap-4">
          {(
            [
              ["voice", "Voice prompts for the member"],
              ["haptics", "Gentle vibration"],
              ["reducedMotion", "Reduced motion"],
              ["comfortableSpeed", "Comfortable activity speed"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-lg">{label}</span>
              <Switch
                checked={Boolean(settings[key])}
                onCheckedChange={(v) => updateSettings({ [key]: v })}
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Privacy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-lg text-muted-foreground">
          <li>Access is role based and consent based.</li>
          <li>Photos and stories are private until the member approves sharing.</li>
          <li>Professional access is time limited and can be withdrawn.</li>
        </ul>
      </section>
    </div>
  );
}

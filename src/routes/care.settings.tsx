import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LANGUAGES } from "@/lib/silirual/i18n";
import { professionals } from "@/lib/silirual/demo-data";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/care/settings")({
  component: CareSettings,
});

function CareSettings() {
  const { settings, setLanguage } = useSilirual();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Settings</h1>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">My profile</h2>
        <div className="mt-2 grid gap-1 text-lg">
          {professionals.map((p) => (
            <p key={p.id}>
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">
                {" "}
                · {p.kind} · {p.memberIds.length} authorised members
              </span>
            </p>
          ))}
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Interface language</h2>
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
        <h2 className="text-2xl font-semibold">Access & privacy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-lg text-muted-foreground">
          <li>Access is time limited and shown to the member and their guardians.</li>
          <li>Personal photos and family stories require separate consent.</li>
          <li>Observations are visible to the member’s authorised guardians.</li>
        </ul>
      </section>
    </div>
  );
}

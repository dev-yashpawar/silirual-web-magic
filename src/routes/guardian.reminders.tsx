import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/guardian/reminders")({
  component: GuardianReminders,
});

const priorityLabel = {
  high: "High priority",
  medium: "Medium priority",
  low: "Gentle nudge",
} as const;

function GuardianReminders() {
  const { reminders, toggleReminder, t } = useSilirual();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Reminders</h1>
        <p className="text-lg text-muted-foreground">
          Asha sees each of these as one large card with a voice prompt and gentle vibration.
        </p>
      </div>

      <div className="grid gap-3">
        {reminders.map((r) => (
          <div key={r.id} className="card-soft flex flex-wrap items-center gap-4 bg-card p-4">
            <span className="text-3xl" aria-hidden="true">
              {r.emoji}
            </span>
            <div className="min-w-40 flex-1">
              <p className="text-lg font-medium">{t(r.labelKey)}</p>
              <p className="text-sm text-muted-foreground">
                {r.time} · {priorityLabel[r.priority]}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm ${
                r.done ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"
              }`}
            >
              {r.done ? "Completed" : "Pending"}
            </span>
            <Button
              variant="calm"
              size="calm"
              onClick={() => {
                toggleReminder(r.id);
                toast.success("Reminder updated for Asha.");
              }}
            >
              {r.done ? "Mark as pending" : "Mark as done"}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        A missed everyday activity is shown calmly to Asha and is never described as an emergency.
      </p>
    </div>
  );
}

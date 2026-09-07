import { Volume2 } from "lucide-react";
import { useSilirual } from "@/lib/silirual/store";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  const { speak, buzz, t } = useSilirual();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setActive(false);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <button
      type="button"
      aria-label={t("common.listen") + `: ${text}`}
      onClick={() => {
        buzz(12);
        setActive(true);
        speak(text);
      }}
      className={cn(
        "inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95",
        active ? "bg-primary text-primary-foreground animate-pulse" : "bg-primary-soft text-primary",
        className,
      )}
    >
      <Volume2 className="size-6" aria-hidden="true" />
    </button>
  );
}

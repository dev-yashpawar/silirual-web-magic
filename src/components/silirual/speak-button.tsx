import { Volume2 } from "lucide-react";
import { useSilirual } from "@/lib/silirual/store";
import { cn } from "@/lib/utils";

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  const { speak, buzz } = useSilirual();
  return (
    <button
      type="button"
      aria-label={`Listen: ${text}`}
      onClick={() => {
        buzz(12);
        speak(text);
      }}
      className={cn(
        "inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform hover:scale-105 active:scale-95",
        className,
      )}
    >
      <Volume2 className="size-6" aria-hidden="true" />
    </button>
  );
}

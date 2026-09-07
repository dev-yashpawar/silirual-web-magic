import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SpeakButton } from "./speak-button";

export function BigCard({
  emoji,
  title,
  body,
  action,
  speakText,
  tone = "plain",
  className,
}: {
  emoji?: string;
  title: string;
  body?: string;
  action?: ReactNode;
  speakText?: string;
  tone?: "plain" | "primary" | "success" | "warning";
  className?: string;
}) {
  const toneClass = {
    plain: "bg-card",
    primary: "bg-primary-soft",
    success: "bg-success-soft",
    warning: "bg-warning-soft",
  }[tone];

  return (
    <section
      className={cn(
        "card-soft gentle-in flex flex-col gap-4 p-5 sm:p-6",
        toneClass,
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {emoji ? (
          <span className="text-4xl leading-none" aria-hidden="true">
            {emoji}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {body ? <p className="mt-1 text-lg text-muted-foreground">{body}</p> : null}
        </div>
        {speakText ? <SpeakButton text={speakText} /> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </section>
  );
}

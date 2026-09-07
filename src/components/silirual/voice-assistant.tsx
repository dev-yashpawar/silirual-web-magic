import { useState } from "react";
import { Mic } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSilirual } from "@/lib/silirual/store";

const COMMANDS = [
  { q: "What should I do now?", a: "Let’s do a short memory activity together.", to: "/member/games" },
  { q: "When is my medicine?", a: "Your next medicine is at 8 in the evening.", to: "/member/day" },
  { q: "Show my memories.", a: "Here are your memories.", to: "/member/memories" },
  { q: "Let’s play a game.", a: "Let’s play Remember the Pattern.", to: "/member/games" },
  { q: "Remind me later.", a: "I will remind you again in a little while.", to: null },
  { q: "What is next?", a: "Next is a glass of water, then a gentle walk.", to: "/member/day" },
] as const;

export function VoiceAssistant() {
  const { t, speak, buzz } = useSilirual();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="voice"
        size="voice"
        onClick={() => {
          buzz(20);
          setOpen(true);
          speak(t("member.talk"));
        }}
      >
        <Mic className="size-7" aria-hidden="true" />
        <span>{t("member.talk")}</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-10 pt-6">
          <SheetHeader className="p-0">
            <SheetTitle className="text-2xl">{t("member.talk")}</SheetTitle>
          </SheetHeader>
          <p className="mt-2 text-lg text-muted-foreground">
            Tap something you would like to say.
          </p>
          <div className="mt-5 grid gap-3">
            {COMMANDS.map((c) => (
              <Button
                key={c.q}
                variant="calm"
                size="calm"
                onClick={() => {
                  buzz(15);
                  setReply(c.a);
                  speak(c.a);
                  if (c.to) {
                    setTimeout(() => {
                      setOpen(false);
                      void navigate({ to: c.to });
                    }, 900);
                  }
                }}
              >
                “{c.q}”
              </Button>
            ))}
          </div>
          {reply ? (
            <p className="mt-5 rounded-2xl bg-primary-soft p-4 text-xl text-primary">{reply}</p>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSilirual } from "@/lib/silirual/store";

export function VoiceAssistant() {
  const { t, speak, buzz, reminders } = useSilirual();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const getDynamicMedicine = () => {
    const nextMeds = reminders.filter(r => !r.done && r.kind === "medicine");
    if (nextMeds.length > 0) {
      return `Your next medicine is at ${nextMeds[0].time}.`;
    }
    return "You have taken all your medicine for today.";
  };

  const COMMANDS = [
    { q: t("voice.whatToDo"), a: t("voice.whatToDoAnswer"), to: "/member/games" },
    { q: t("voice.medicine"), a: getDynamicMedicine(), to: "/member/day" },
    { q: t("voice.showMemories"), a: t("voice.showMemoriesAnswer"), to: "/member/memories" },
    { q: t("voice.playGame"), a: t("voice.playGameAnswer"), to: "/member/games" },
    { q: t("voice.remindLater"), a: t("voice.remindLaterAnswer"), to: null },
    { q: t("voice.whatsNext"), a: t("voice.whatsNextAnswer"), to: "/member/day" },
  ] as const;

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => setListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        // Simple logic for matching commands
        const match = COMMANDS.find(c => transcript.includes(c.q.toLowerCase().replace(/[^a-z0-9 ]/g, '')));
        if (match) {
            setReply(match.a);
            speak(match.a);
            if (match.to) {
                setTimeout(() => {
                    setOpen(false);
                    void navigate({ to: match.to });
                }, 900);
            }
        } else {
            setReply("I didn't quite catch that. Could you try again?");
            speak("I didn't quite catch that. Could you try again?");
        }
      };
      recognition.onend = () => setListening(false);
      recognition.start();
    }
  };


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
          <SheetHeader className="p-0 flex flex-row items-center justify-between">
            <SheetTitle className="text-2xl">{t("member.talk")}</SheetTitle>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                startListening();
                buzz(15);
            }}>
                <Mic className={`size-6 ${listening ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </SheetHeader>
          <p className="mt-2 text-lg text-muted-foreground">
            {listening ? "Listening..." : "Tap something you would like to say, or tap the mic icon."}
          </p>
          <div className="mt-5 grid gap-3">
            {COMMANDS.map((c, i) => (
              <Button
                key={i}
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

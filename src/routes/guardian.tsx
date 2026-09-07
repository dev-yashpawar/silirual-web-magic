import { createFileRoute } from "@tanstack/react-router";
import { CareShell, type CareNavItem } from "@/components/silirual/care-shell";

const items: CareNavItem[] = [
  { to: "/guardian", label: "Dashboard", exact: true },
  { to: "/guardian/member", label: "Member" },
  { to: "/guardian/progress", label: "Progress" },
  { to: "/guardian/memories", label: "Memories" },
  { to: "/guardian/reminders", label: "Reminders" },
  { to: "/guardian/alerts", label: "Alerts" },
  { to: "/guardian/connections", label: "Connections" },
  { to: "/guardian/settings", label: "Settings" },
];

export const Route = createFileRoute("/guardian")({
  head: () => ({
    meta: [
      { title: "Family Guardian — SILIRUAL" },
      {
        name: "description",
        content:
          "Follow your loved one's day, activity patterns, reminders and memories in one warm, easy overview.",
      },
      { property: "og:title", content: "Family Guardian — SILIRUAL" },
      {
        property: "og:description",
        content: "A warm overview of daily activity, progress, reminders and shared memories.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <CareShell title="Family Guardian" subtitle="Anita · Daughter of Asha" items={items} />
  ),
});

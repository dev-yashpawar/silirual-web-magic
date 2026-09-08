import { createFileRoute } from "@tanstack/react-router";
import { CareShell, type CareNavItem } from "@/components/silirual/care-shell";

const items: CareNavItem[] = [
  { to: "/care", label: "Dashboard", exact: true },
  { to: "/care/members", label: "Members" },
  { to: "/care/analytics", label: "Analytics" },
  { to: "/care/activities", label: "Activities" },
  { to: "/care/alerts", label: "Alerts" },
  { to: "/care/notes", label: "Notes" },
  { to: "/care/settings", label: "Settings" },
];

import { professionals } from "@/lib/silirual/demo-data";

function CareLayout() {
  const p = professionals[0]!;
  return <CareShell title="Care Professional" subtitle={`${p.name} · ${p.kind}`} items={items} />;
}

export const Route = createFileRoute("/care")({
  head: () => ({
    meta: [
      { title: "Care Professional — CiliRual" },
      {
        name: "description",
        content:
          "Authorised view of activity history, engagement trends, routine adherence and observation notes for consenting members.",
      },
      { property: "og:title", content: "Care Professional — CiliRual" },
      {
        property: "og:description",
        content: "Activity history, engagement trends, adherence and observation notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareLayout,
});

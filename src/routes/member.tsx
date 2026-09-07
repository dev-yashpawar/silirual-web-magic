import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/silirual/member-shell";

export const Route = createFileRoute("/member")({
  head: () => ({
    meta: [
      { title: "My Space — CiliRual" },
      {
        name: "description",
        content:
          "A calm daily space with memories, gentle activities and routine support, made for comfortable reading.",
      },
      { property: "og:title", content: "My Space — CiliRual" },
      {
        property: "og:description",
        content: "Memories, gentle activities and routine support in one calm place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemberShell,
});

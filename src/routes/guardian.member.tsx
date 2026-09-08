import { createFileRoute } from "@tanstack/react-router";
import { familyMembers, members, rootsCardsData } from "@/lib/silirual/demo-data";
import { useSilirual } from "@/lib/silirual/store";

export const Route = createFileRoute("/guardian/member")({
  component: MemberProfile,
});

function MemberProfile() {
  const { t, member } = useSilirual();
  const roots = rootsCardsData[member.id] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{member.name}</h1>

      <section className="card-soft grid gap-3 bg-card p-5 sm:grid-cols-2">
        {[
          ["Age", String(member.age)],
          ["Region", member.region],
          ["Hometown", member.hometown],
          ["Occupation", member.occupation],
          [t("profile.language"), member.language.toUpperCase()],
          [t("connection.code"), member.connectionCode],
        ].map(([label, value]) => (
          <p key={label} className="text-lg">
            <span className="text-muted-foreground">{label}: </span>
            <span className="font-medium">{value}</span>
          </p>
        ))}
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Interests</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {member.interests.map((i) => (
            <span key={i} className="rounded-full bg-secondary px-4 py-2 text-base">
              {i}
            </span>
          ))}
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Family & relationships</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {familyMembers
            .filter((f) => f.memberId === member.id)
            .map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
                <span className="text-2xl" aria-hidden="true">
                  {f.emoji}
                </span>
                <span className="text-lg font-medium">{f.name}</span>
                <span className="text-base text-muted-foreground">{f.relation}</span>
              </div>
            ))}
        </div>
      </section>

      <section className="card-soft bg-card p-5">
        <h2 className="text-2xl font-semibold">Cultural background</h2>
        <p className="text-base text-muted-foreground">
          Used to suggest familiar songs, places and festivals — kept specific to {member.name}'s own region.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {roots.map((c) => (
            <p key={c.key} className="text-lg">
              <span aria-hidden="true">{c.emoji} </span>
              <span className="font-medium">{t(c.titleKey)}: </span>
              <span className="text-muted-foreground">{t(c.detailKey)}</span>
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

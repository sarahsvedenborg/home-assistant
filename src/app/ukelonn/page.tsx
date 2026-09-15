import { WeeklyPayList } from "@/components/weekly-pay-list";
import { getFamilyMembers } from "@/lib/data";

export default async function UkelonnPage() {
  const familyMembers = (await getFamilyMembers()).filter((member) => {
    const name = member.name.trim().toLowerCase();
    return name !== "mamma" && name !== "pappa";
  });

  return (
    <main className="shell weeklyPayShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Ukelønn</h1>
        </div>
      </header>

      <WeeklyPayList initialMembers={familyMembers} />
    </main>
  );
}

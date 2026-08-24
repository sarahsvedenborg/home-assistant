import { WeeklyPayList } from "@/components/weekly-pay-list";
import { getFamilyMembers } from "@/lib/data";

export default async function UkelonnPage() {
  const familyMembers = await getFamilyMembers();

  return (
    <main className="shell weeklyPayShell">
      <section className="sectionHero accentWarm">
        <div>
          <span className="kicker">Ukens oppgaver</span>
          <h1 style={{ margin: "0.25em 0" }}>Ukelønn</h1>
          <p>Registrer hver gang en oppgave er utført. Summen oppdateres automatisk.</p>
        </div>
      </section>

      <WeeklyPayList initialMembers={familyMembers} />
    </main>
  );
}

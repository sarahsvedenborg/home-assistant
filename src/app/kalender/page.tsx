import { FamilyCalendar } from "@/components/family-calendar";
import { getRecurringEvents, getSingleEvents } from "@/lib/data";
import { osloDateKey } from "@/lib/family-feed";

export default async function KalenderPage() {
  const [recurringEvents, singleEvents] = await Promise.all([
    getRecurringEvents(),
    getSingleEvents(),
  ]);

  return (
    <main className="shell calendarShell">
      <section className="sectionHero calendarHero accentCoolPanel">
        <div>
          <span className="kicker">Familieoversikt</span>
          <h1>Kalender</h1>
          <p>Avtaler og faste aktiviteter samlet på ett sted.</p>
        </div>
        <div className="sectionBadge">
          {singleEvents.length + recurringEvents.length} hendelser
        </div>
      </section>

      <FamilyCalendar
        recurringEvents={recurringEvents}
        singleEvents={singleEvents}
        todayDateKey={osloDateKey(new Date())}
      />
    </main>
  );
}

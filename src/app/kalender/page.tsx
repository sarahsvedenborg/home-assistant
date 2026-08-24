import { AddButton } from "@/components/add-button";
import { DayNoteForm } from "@/components/day-note-form";
import { FamilyCalendar } from "@/components/family-calendar";
import { getDayNotes, getRecurringEvents, getSingleEvents } from "@/lib/data";
import { osloDateKey } from "@/lib/family-feed";

export default async function KalenderPage() {
  const [dayNotes, recurringEvents, singleEvents] = await Promise.all([
    getDayNotes(),
    getRecurringEvents(),
    getSingleEvents(),
  ]);
  const todayDateKey = osloDateKey(new Date());

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
        dayNotes={dayNotes}
        todayDateKey={todayDateKey}
      />

      <AddButton title="Nytt dagsnotat" label="Nytt notat" anchor="add-note">
        <DayNoteForm initialDate={todayDateKey} />
      </AddButton>
    </main>
  );
}

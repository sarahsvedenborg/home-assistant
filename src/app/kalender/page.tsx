import { AddButton } from "@/components/add-button";
import { DayNoteForm } from "@/components/day-note-form";
import { FamilyCalendar } from "@/components/family-calendar";
import { SingleEventForm } from "@/components/single-event-form";
import { getDayNotes, getFamilyMembers, getRecurringEvents, getSingleEvents } from "@/lib/data";
import { osloDateKey } from "@/lib/family-feed";
import { getNorwegianPublicHolidays } from "@/lib/norwegian-holidays";

export default async function KalenderPage() {
  const todayDateKey = osloDateKey(new Date());
  const currentYear = Number(todayDateKey.slice(0, 4));
  const [dayNotes, familyMembers, holidays, recurringEvents, singleEvents] =
    await Promise.all([
      getDayNotes(),
      getFamilyMembers(),
      getNorwegianPublicHolidays([
        currentYear - 1,
        currentYear,
        currentYear + 1,
      ]),
      getRecurringEvents(),
      getSingleEvents(),
    ]);

  return (
    <main className="shell calendarShell">
      <h1 className="srOnly">Kalender</h1>

      <FamilyCalendar
        recurringEvents={recurringEvents}
        singleEvents={singleEvents}
        dayNotes={dayNotes}
        holidays={holidays}
        todayDateKey={todayDateKey}
      />

      <AddButton
        title="Legg til hendelse"
        label="Ny hendelse"
        anchor="add-event"
        hideTriggerOnMobile
        wide
      >
        <SingleEventForm familyMembers={familyMembers.map((member) => member.name)} />
      </AddButton>

      <AddButton
        title="Nytt dagsnotat"
        label="Nytt notat"
        anchor="add-note"
        hideTrigger
      >
        <DayNoteForm initialDate={todayDateKey} />
      </AddButton>
    </main>
  );
}

import { AddButton } from "@/components/add-button";
import { DayNoteForm } from "@/components/day-note-form";
import { FamilyCalendar } from "@/components/family-calendar";
import { SingleEventForm } from "@/components/single-event-form";
import { getBirthdays, getDayNotes, getFamilyMembers, getRecurringEvents, getSingleEvents } from "@/lib/data";
import { osloDateKey } from "@/lib/family-feed";
import { getNorwegianPublicHolidays } from "@/lib/norwegian-holidays";

type KalenderPageProps = {
  searchParams: Promise<{
    event?: string | string[];
  }>;
};

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function KalenderPage({ searchParams }: KalenderPageProps) {
  const query = await searchParams;
  const todayDateKey = osloDateKey(new Date());
  const currentYear = Number(todayDateKey.slice(0, 4));
  const [birthdays, dayNotes, familyMembers, holidays, recurringEvents, singleEvents] =
    await Promise.all([
      getBirthdays(),
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
        birthdays={birthdays}
        dayNotes={dayNotes}
        holidays={holidays}
        todayDateKey={todayDateKey}
        initialEventId={firstSearchParam(query.event)}
      />

      <AddButton
        title="Legg til hendelse"
        label="Ny hendelse"
        anchor="add-event"
        hideTriggerOnMobile
        wide
        modalClassName="formModalEvents"
      >
        <SingleEventForm familyMembers={familyMembers.map((member) => member.name)} />
      </AddButton>

      <AddButton
        title="Nytt dagsnotat"
        label="Nytt notat"
        anchor="add-note"
        hideTrigger
        modalClassName="formModalNotes"
      >
        <DayNoteForm initialDate={todayDateKey} />
      </AddButton>
    </main>
  );
}

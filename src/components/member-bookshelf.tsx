import { BookCover } from "@/components/book-cover";
import { EmptyState } from "@/components/empty-state";
import {
  READING_TYPE_LABELS,
  formatReaderList,
  formatReadingDate,
  groupedBookshelf,
  isCurrentlyReading,
  otherReaderNames,
  readingProgressLabel,
} from "@/lib/readings";
import type { FamilyMember, Reading } from "@/lib/types";

type MemberBookshelfProps = {
  member: FamilyMember;
  readings: Reading[];
};

export function MemberBookshelf({ member, readings }: MemberBookshelfProps) {
  const sections = groupedBookshelf(readings, member);
  const hasAny = sections.some((section) => section.readings.length > 0);

  if (!hasAny) {
    return (
      <EmptyState
        title="Hyllen er tom"
        description={`${member.name} har ingen registrerte bøker enda.`}
      />
    );
  }

  return (
    <div className="bookshelf">
      {sections.map((section) =>
        section.readings.length === 0 ? null : (
          <section key={section.status} className="bookshelfSection">
            <h2>{section.label}</h2>
            <div className="shelfGrid">
              {section.readings.map((reading) => {
                const companions = formatReaderList(
                  otherReaderNames(reading, member.id),
                );
                const progress = readingProgressLabel(reading);
                const started = formatReadingDate(reading.startedAt);
                const finished = formatReadingDate(reading.finishedAt);

                return (
                  <article key={reading.id} className="shelfBook">
                    <BookCover book={reading.book} className="shelfBookCover" />
                    <div className="shelfBookCopy">
                      <strong>{reading.book.title}</strong>
                      <p>{reading.book.author}</p>
                      <p>{READING_TYPE_LABELS[reading.readingType]}</p>
                      {companions ? <p>Sammen med {companions}</p> : null}
                      {progress && isCurrentlyReading(reading) ? (
                        <p>{progress}</p>
                      ) : null}
                      {typeof reading.rating === "number" ? (
                        <p>Terningkast {reading.rating}</p>
                      ) : null}
                      {started ? <p>Startet {started}</p> : null}
                      {finished ? <p>Ferdig {finished}</p> : null}
                      {reading.note ? <p>{reading.note}</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ),
      )}
    </div>
  );
}

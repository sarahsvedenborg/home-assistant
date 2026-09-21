import Link from "next/link";

import { BookCover } from "@/components/book-cover";
import { LibraryYearSelect } from "@/components/library-year-select";
import {
  LIBRARY_QUOTE,
  currentReadingsForMember,
  defaultFinishedYear,
  finishedReadingYears,
  finishedReadingsInYear,
  libraryTitle,
  osloYear,
  readingProgressLabel,
  readingProgressPercent,
} from "@/lib/readings";
import type { FamilyMember, Reading } from "@/lib/types";

const CURRENT_PREVIEW = 3;
const SHELF_PREVIEW = 6;

type MemberLibraryProps = {
  members: FamilyMember[];
  member: FamilyMember;
  readings: Reading[];
  year?: number;
  showAllCurrent?: boolean;
  showAllShelf?: boolean;
};

function libraryHref(
  memberId: string,
  options: { year: number; now?: boolean; shelf?: boolean },
) {
  const params = new URLSearchParams();
  params.set("year", String(options.year));
  if (options.now) {
    params.set("now", "all");
  }
  if (options.shelf) {
    params.set("shelf", "all");
  }
  return `/boker/${encodeURIComponent(memberId)}?${params.toString()}`;
}

function booksReadThisYearLabel(count: number) {
  return count === 1 ? "1 bok lest i år" : `${count} bøker lest i år`;
}

export function MemberLibrary({
  members,
  member,
  readings,
  year,
  showAllCurrent = false,
  showAllShelf = false,
}: MemberLibraryProps) {
  const years = finishedReadingYears(readings, member.id);
  const selectedYear = year && years.includes(year) ? year : defaultFinishedYear(readings, member.id);
  const current = currentReadingsForMember(readings, member.id);
  const finishedThisYear = finishedReadingsInYear(readings, member.id, osloYear());
  const shelf = finishedReadingsInYear(readings, member.id, selectedYear);
  const visibleCurrent = showAllCurrent ? current : current.slice(0, CURRENT_PREVIEW);
  const visibleShelf = showAllShelf ? shelf : shelf.slice(0, SHELF_PREVIEW);

  return (
    <div className="libraryLayout">
      <nav className="libraryNav" aria-label="Familiemedlemmer">
        {members.map((item) => {
          const isActive = item.id === member.id;

          return (
            <Link
              key={item.id}
              href={`/boker/${encodeURIComponent(item.id)}`}
              className={isActive ? "libraryNavLink libraryNavLinkActive" : "libraryNavLink"}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="libraryNavIcon"
                style={
                  item.accentColor ? { backgroundColor: item.accentColor } : undefined
                }
                aria-hidden="true"
              >
                {item.emoji || "👤"}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="libraryMain">
        <header className="libraryHero">
          <div>
            <h1>
              <span aria-hidden="true">📖</span>
              {libraryTitle(member.name)}
            </h1>
            <p className="libraryQuote">«{LIBRARY_QUOTE}»</p>
          </div>
          <p className="libraryStat">
            <span aria-hidden="true">📗</span>
            {booksReadThisYearLabel(finishedThisYear.length)}
          </p>
        </header>

        <section className="librarySection">
          <div className="librarySectionHead">
            <h2>
              <span aria-hidden="true">❤</span>
              Leser nå
            </h2>
            {current.length > CURRENT_PREVIEW ? (
              <Link
                href={libraryHref(member.id, {
                  year: selectedYear,
                  now: !showAllCurrent,
                  shelf: showAllShelf,
                })}
                className="libraryMore"
              >
                {showAllCurrent ? "Vis færre" : `Se alle ${current.length}`}
                <span aria-hidden="true"> →</span>
              </Link>
            ) : null}
          </div>

          <div className="libraryNowGrid">
            {visibleCurrent.map((reading) => {
              const percent = readingProgressPercent(reading);
              const pages = readingProgressLabel(reading);

              return (
                <article key={reading.id} className="libraryNowCard">
                  <BookCover book={reading.book} className="libraryNowCover" />
                  <div className="libraryNowCopy">
                    <strong>{reading.book.title}</strong>
                    <p>{reading.book.author}</p>
                    {percent !== null ? (
                      <div className="libraryNowMeta">
                        <span className="libraryNowBar" aria-hidden="true">
                          <span style={{ width: `${percent}%` }} />
                        </span>
                        <span>{percent}%</span>
                      </div>
                    ) : null}
                    {pages ? <p className="libraryNowPages">{pages}</p> : null}
                  </div>
                </article>
              );
            })}

            <a href="#add-book" className="libraryAddCard">
              <span className="libraryAddIcon" aria-hidden="true">
                +
              </span>
              <strong>Legg til bok</strong>
              <p>Søk og start en ny bok</p>
            </a>
          </div>
        </section>

        <section className="librarySection">
          <div className="librarySectionHead">
            <h2>
              <span aria-hidden="true">📚</span>
              Bokhyllen min
            </h2>
            <LibraryYearSelect years={years} selectedYear={selectedYear} />
            {shelf.length > SHELF_PREVIEW ? (
              <Link
                href={libraryHref(member.id, {
                  year: selectedYear,
                  now: showAllCurrent,
                  shelf: !showAllShelf,
                })}
                className="libraryMore"
              >
                {showAllShelf ? "Vis færre" : `Se alle ${shelf.length}`}
                <span aria-hidden="true"> →</span>
              </Link>
            ) : null}
          </div>

          {visibleShelf.length === 0 ? (
            <p className="libraryShelfEmpty">
              Ingen ferdige bøker i {selectedYear}.
            </p>
          ) : (
            <div className="libraryShelf">
              {visibleShelf.map((reading) => (
                <article key={reading.id} className="libraryShelfBook">
                  <BookCover book={reading.book} className="libraryShelfCover" />
                  <strong>{reading.book.title}</strong>
                  <p>{reading.book.author}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

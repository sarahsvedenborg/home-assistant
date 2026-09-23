import Link from "next/link";

import { BookCover } from "@/components/book-cover";
import { LibraryYearSelect } from "@/components/library-year-select";
import {
  LIBRARY_QUOTE,
  currentReadingsForMember,
  defaultFinishedYear,
  finishedReadingYears,
  finishedReadingsInYear,
  libraryAuthorInsight,
  libraryTitle,
  osloYear,
  readingProgressLabel,
  readingProgressPercent,
  togetherFinishedReadings,
  wantToReadForMember,
} from "@/lib/readings";
import type { FamilyMember, Reading } from "@/lib/types";

const CURRENT_PREVIEW = 3;
const SHELF_PREVIEW = 6;
const WISH_PREVIEW = 4;
const TOGETHER_PREVIEW = 5;

type MemberLibraryProps = {
  members: FamilyMember[];
  member: FamilyMember;
  readings: Reading[];
  year?: number;
  showAllCurrent?: boolean;
  showAllShelf?: boolean;
  showAllWish?: boolean;
  showAllTogether?: boolean;
};

function libraryHref(
  memberId: string,
  options: {
    year: number;
    now?: boolean;
    shelf?: boolean;
    wish?: boolean;
    together?: boolean;
  },
) {
  const params = new URLSearchParams();
  params.set("year", String(options.year));
  if (options.now) {
    params.set("now", "all");
  }
  if (options.shelf) {
    params.set("shelf", "all");
  }
  if (options.wish) {
    params.set("wish", "all");
  }
  if (options.together) {
    params.set("together", "all");
  }
  return `/boker/${encodeURIComponent(memberId)}?${params.toString()}`;
}

function bookCountLabel(count: number, suffix: string) {
  return count === 1 ? `1 bok ${suffix}` : `${count} bøker ${suffix}`;
}

export function MemberLibrary({
  members,
  member,
  readings,
  year,
  showAllCurrent = false,
  showAllShelf = false,
  showAllWish = false,
  showAllTogether = false,
}: MemberLibraryProps) {
  const years = finishedReadingYears(readings, member.id);
  const selectedYear = year && years.includes(year) ? year : defaultFinishedYear(readings, member.id);
  const current = currentReadingsForMember(readings, member.id);
  const wishlist = wantToReadForMember(readings, member.id);
  const finishedThisYear = finishedReadingsInYear(readings, member.id, osloYear());
  const shelf = finishedReadingsInYear(readings, member.id, selectedYear);
  const together = togetherFinishedReadings(readings);
  const insight = libraryAuthorInsight(readings, member.id);
  const visibleCurrent = showAllCurrent ? current : current.slice(0, CURRENT_PREVIEW);
  const visibleShelf = showAllShelf ? shelf : shelf.slice(0, SHELF_PREVIEW);
  const visibleWish = showAllWish ? wishlist : wishlist.slice(0, WISH_PREVIEW);
  const visibleTogether = showAllTogether ? together : together.slice(0, TOGETHER_PREVIEW);
  const hrefState = {
    year: selectedYear,
    now: showAllCurrent,
    shelf: showAllShelf,
    wish: showAllWish,
    together: showAllTogether,
  };

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
      {/*     <div className="libraryHeroStats">
            <p className="libraryStat">
              <span aria-hidden="true">📗</span>
              {bookCountLabel(finishedThisYear.length, "lest i år")}
            </p>
            <p className="libraryStat">
              <span aria-hidden="true">💛</span>
              {bookCountLabel(current.length, "leser nå")}
            </p>
            <p className="libraryStat">
              <span aria-hidden="true">⭐</span>
              {bookCountLabel(wishlist.length, "på ønskelisten")}
            </p>
            <a href="#add-book" className="addFab libraryAddFab">
              <span className="addFabIcon" aria-hidden="true">
                +
              </span>
              <span className="addFabLabel">Legg til bok</span>
            </a>
          </div> */}
        </header>

        <div className="libraryBody">
          <section className="librarySection libraryNow accentWarm">
            <div className="librarySectionHead">
              <h2>
                <span aria-hidden="true">❤️</span>
                Leser nå
              </h2>
              {current.length > CURRENT_PREVIEW ? (
                <Link
                  href={libraryHref(member.id, { ...hrefState, now: !showAllCurrent })}
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

          <section className="librarySection libraryWish accentFuture">
            <div className="librarySectionHead">
              <h2>
                <span aria-hidden="true">🔖</span>
                Neste på ønskelisten
              </h2>
              {wishlist.length > WISH_PREVIEW ? (
                <Link
                  href={libraryHref(member.id, { ...hrefState, wish: !showAllWish })}
                  className="libraryMore"
                >
                  {showAllWish ? "Vis færre" : `Se alle ${wishlist.length}`}
                  <span aria-hidden="true"> →</span>
                </Link>
              ) : null}
            </div>

            {visibleWish.length === 0 ? (
              <p className="libraryEmpty">Ingen bøker på ønskelisten ennå.</p>
            ) : (
              <div className="libraryWishGrid">
                {visibleWish.map((reading) => (
                  <article key={reading.id} className="libraryWishCard">
                    <BookCover book={reading.book} className="libraryWishCover" />
                    <strong>{reading.book.title}</strong>
                    <p>{reading.book.author}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="librarySection libraryShelfSection accentCool">
          <div className="librarySectionHead">
            <h2>
              <span aria-hidden="true">📚</span>
              Bokhyllen min
            </h2>
            <LibraryYearSelect years={years} selectedYear={selectedYear} />
            {shelf.length > SHELF_PREVIEW ? (
              <Link
                href={libraryHref(member.id, { ...hrefState, shelf: !showAllShelf })}
                className="libraryMore"
              >
                {showAllShelf ? "Vis færre" : `Se alle ${shelf.length}`}
                <span aria-hidden="true"> →</span>
              </Link>
            ) : null}
          </div>

          {visibleShelf.length === 0 ? (
            <div className="libraryShelfEmpty">
              <p>Ingen ferdige bøker i {selectedYear}.</p>
              <span className="libraryShelfBoard" aria-hidden="true" />
            </div>
          ) : (
            <div className="libraryShelf">
              {visibleShelf.map((reading) => (
                <article key={reading.id} className="libraryShelfBook">
                  <div className="libraryShelfCoverWrap">
                    <BookCover book={reading.book} className="libraryShelfCover" />
                  </div>
                  <div className="libraryShelfCaption">
                    <strong>{reading.book.title}</strong>
                    <p>{reading.book.author}</p>
                  </div>
                </article>
              ))}
              <span className="libraryShelfBoard" aria-hidden="true" />
            </div>
          )}
        </section>

        <div className="librarySideNotes">
            <section className="librarySection libraryInsight accentFuture hubCardLearn">
              <div className="librarySectionHead">
                <h2>
                  <span aria-hidden="true">💡</span>
                  Småøyeblikk
                </h2>
              </div>
              <p>
                {insight ||
                  "Når du har lest noen bøker, dukker det opp små funn her."}
              </p>
            </section>

            <section className="librarySection accentWarm">
              <div className="librarySectionHead">
                <h2>
                  <span aria-hidden="true">👥</span>
                  Sammen har vi lest
                </h2>
                {together.length > TOGETHER_PREVIEW ? (
                  <Link
                    href={libraryHref(member.id, {
                      ...hrefState,
                      together: !showAllTogether,
                    })}
                    className="libraryMore"
                  >
                    {showAllTogether ? "Vis færre" : "Se alle"}
                    <span aria-hidden="true"> →</span>
                  </Link>
                ) : null}
              </div>

              {visibleTogether.length === 0 ? (
                <p className="libraryEmpty">Ingen bøker lest sammen ennå.</p>
              ) : (
                <div className="libraryTogether">
                  <div className="libraryTogetherCovers">
                    {visibleTogether.map((reading) => (
                      <BookCover
                        key={reading.id}
                        book={reading.book}
                        className="libraryTogetherCover"
                      />
                    ))}
                  </div>
                  <p className="libraryTogetherCount">
                    {bookCountLabel(together.length, "sammen")}
                  </p>
                </div>
              )}
            </section>
        </div>
      </div>
    </div>
  );
}

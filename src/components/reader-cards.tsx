import Link from "next/link";

import { BookCover } from "@/components/book-cover";
import {
  formatReaderList,
  currentReadingsForMember,
  otherReaderNames,
  readingProgressLabel,
  readingProgressPercent,
} from "@/lib/readings";
import type { FamilyMember, Reading } from "@/lib/types";

type ReaderCardsProps = {
  members: FamilyMember[];
  readings: Reading[];
};

export function ReaderCards({ members, readings }: ReaderCardsProps) {
  return (
    <div className="readerGrid">
      {members.map((member) => {
        const current = currentReadingsForMember(readings, member.id);

        return (
          <Link
            key={member.id}
            href={`/boker/${encodeURIComponent(member.id)}`}
            className="readerCard"
          >
            <div className="readerCardHeader">
              <span
                className="readerCardEmoji"
                style={
                  member.accentColor
                    ? { backgroundColor: member.accentColor }
                    : undefined
                }
              >
                {member.emoji || "👤"}
              </span>
              <h2>{member.name}</h2>
            </div>

            {current.length > 0 ? (
              <div className="readerCardBooks">
                {current.map((reading) => {
                  const companions = formatReaderList(
                    otherReaderNames(reading, member.id),
                  );
                  const progress = readingProgressLabel(reading);
                  const percent = readingProgressPercent(reading);

                  return (
                    <div key={reading.id} className="readerNow">
                      <BookCover book={reading.book} className="readerNowCover" />
                      <div className="readerNowCopy">
                        <p className="readerNowKicker">Leser nå</p>
                        <strong>{reading.book.title}</strong>
                        <p>{reading.book.author}</p>
                        {companions ? <p>Sammen med {companions}</p> : null}
                        {progress ? <p>{progress}</p> : null}
                        {percent !== null ? (
                          <span
                            className="readerProgress"
                            aria-hidden="true"
                          >
                            <span style={{ width: `${percent}%` }} />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="readerCardEmpty">Leser ikke noe akkurat nå</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}

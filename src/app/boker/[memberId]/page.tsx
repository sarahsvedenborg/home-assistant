import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberBookshelf } from "@/components/member-bookshelf";
import { getFamilyMembers, getReadings } from "@/lib/data";
import { bookshelfTitle } from "@/lib/readings";

type BookshelfPageProps = {
  params: Promise<{
    memberId: string;
  }>;
};

export default async function MemberBookshelfPage({ params }: BookshelfPageProps) {
  const { memberId } = await params;
  const [familyMembers, readings] = await Promise.all([
    getFamilyMembers(),
    getReadings(),
  ]);
  const member = familyMembers.find(
    (item) => item.id === decodeURIComponent(memberId),
  );

  if (!member) {
    notFound();
  }

  return (
    <main className="shell booksShell">
      <header className="issueBoardToolbar">
        <div>
          <Link href="/boker" className="recipeBackLink">
            <span aria-hidden="true">←</span>
            Tilbake til bøker
          </Link>
          <h1>
            {member.emoji ? `${member.emoji} ` : null}
            {bookshelfTitle(member.name)}
          </h1>
        </div>
      </header>

      <section className="listStack">
        <MemberBookshelf member={member} readings={readings} />
      </section>
    </main>
  );
}

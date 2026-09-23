import { AddButton } from "@/components/add-button";
import { BookForm } from "@/components/book-form";
import { MemberLibrary } from "@/components/member-library";
import { getFamilyMembers, getReadings } from "@/lib/data";
import { notFound } from "next/navigation";

type BookshelfPageProps = {
  params: Promise<{
    memberId: string;
  }>;
  searchParams: Promise<{
    year?: string | string[];
    now?: string | string[];
    shelf?: string | string[];
    wish?: string | string[];
    together?: string | string[];
  }>;
};

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseYearParam(value?: string) {
  if (!value || !/^\d{4}$/.test(value)) {
    return undefined;
  }

  return Number(value);
}

export default async function MemberBookshelfPage({
  params,
  searchParams,
}: BookshelfPageProps) {
  const { memberId } = await params;
  const query = await searchParams;
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
    <main className="shell booksShell libraryShell">
      <MemberLibrary
        members={familyMembers}
        member={member}
        readings={readings}
        year={parseYearParam(firstSearchParam(query.year))}
        showAllCurrent={firstSearchParam(query.now) === "all"}
        showAllShelf={firstSearchParam(query.shelf) === "all"}
        showAllWish={firstSearchParam(query.wish) === "all"}
        showAllTogether={firstSearchParam(query.together) === "all"}
      />

      <AddButton
        title="Legg til bok"
        label="Legg til bok"
        anchor="add-book"
        hideTrigger
        wide
        modalClassName="formModalBooks"
      >
        <BookForm
          familyMembers={familyMembers.map((item) => item.name)}
          defaultReaders={[member.name]}
        />
      </AddButton>
    </main>
  );
}

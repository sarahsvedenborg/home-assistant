import { AddButton } from "@/components/add-button";
import { BookForm } from "@/components/book-form";
import { EmptyState } from "@/components/empty-state";
import { ReaderCards } from "@/components/reader-cards";
import { getFamilyMembers, getReadings } from "@/lib/data";

export default async function BokerPage() {
  const [familyMembers, readings] = await Promise.all([
    getFamilyMembers(),
    getReadings(),
  ]);

  return (
    <main className="shell booksShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Bøker</h1>
        </div>
      </header>

      <section className="listStack">
        {familyMembers.length === 0 ? (
          <EmptyState
            title="Ingen familiemedlemmer"
            description="Legg til familiemedlemmer i Studio for å vise bokhyllene."
          />
        ) : (
          <ReaderCards members={familyMembers} readings={readings} />
        )}
      </section>

      <AddButton title="Legg til bok" label="Legg til bok" anchor="add-book">
        <BookForm />
      </AddButton>
    </main>
  );
}

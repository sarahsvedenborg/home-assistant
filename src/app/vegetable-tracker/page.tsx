import Link from "next/link";

const VEGETABLE_TRACKER_URL = "https://vegetable-tracker.vercel.app/consumption/track";

export default function VegetableTrackerPage() {
  return (
    <main className="shell vegetableTrackerShell">
      <header className="issueBoardToolbar">
        <div>
          <Link href="/" className="recipeBackLink">
            <span aria-hidden="true">←</span>
            Tilbake til dashboard
          </Link>
          <h1>Grønnsaker</h1>
        </div>
      </header>
      <iframe
        className="vegetableTrackerFrame"
        src={VEGETABLE_TRACKER_URL}
        title="Grønnsakssporing"
      />
    </main>
  );
}

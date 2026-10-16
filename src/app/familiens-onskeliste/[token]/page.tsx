import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OnskelisteTabs } from "@/components/onskeliste-tabs";
import { getFamilyMembers, getWishListItems } from "@/lib/data";
import { isValidShareToken } from "@/lib/share-link";

// Public, share-by-link page for the extended family. Access is a capability
// URL: the secret token lives in the path and is checked below. Kept out of
// search indexes, and no-referrer so the secret URL never leaks via Referer.
export const metadata: Metadata = {
  title: "Familiens ønskeliste",
  robots: "noindex",
  referrer: "no-referrer",
};

type PublicWishlistPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicWishlistPage({ params }: PublicWishlistPageProps) {
  const { token } = await params;

  // Wrong or missing token renders a plain 404 — no signal that the page exists.
  if (!isValidShareToken(token)) {
    notFound();
  }

  const [familyMembers, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getWishListItems(),
  ]);

  return (
    <main className="shell wishShell">
      <header className="issueBoardToolbar publicWishToolbar">
        <div>
          <h1>Familien Svedenborgs ønskeliste</h1>
        </div>
      </header>

      <OnskelisteTabs
        familyMembers={familyMembers}
        wishListItems={wishListItems}
        allowAdd={false}
      />
    </main>
  );
}

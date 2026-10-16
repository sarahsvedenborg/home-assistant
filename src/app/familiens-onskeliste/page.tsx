import type { Metadata } from "next";

import { OnskelisteTabs } from "@/components/onskeliste-tabs";
import { getFamilyMembers, getWishListItems } from "@/lib/data";

// Public, share-by-link page for the extended family. Kept out of search
// indexes since it is meant to be shared directly, not discovered.
export const metadata: Metadata = {
  title: "Familiens ønskeliste",
  robots: "noindex",
};

export default async function PublicWishlistPage() {
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

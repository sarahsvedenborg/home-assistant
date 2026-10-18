import { OnskelisteTabs } from "@/components/onskeliste-tabs";
import { ShareLinkButton } from "@/components/share-link-button";
import { getFamilyMembers, getWishListItems } from "@/lib/data";
import { getShareLinkPath } from "@/lib/share-link";

export default async function OnskelistePage() {
  const [familyMembers, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getWishListItems(),
  ]);

  const sharePath = getShareLinkPath();

  return (
    <main className="shell wishShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Ønskeliste</h1>
        </div>
        {sharePath ? <ShareLinkButton path={sharePath} /> : null}
      </header>

      <OnskelisteTabs
        familyMembers={familyMembers}
        wishListItems={wishListItems}
        showSizes
      />
    </main>
  );
}

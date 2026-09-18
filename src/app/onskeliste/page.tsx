import { OnskelisteTabs } from "@/components/onskeliste-tabs";
import { getFamilyMembers, getWishListItems } from "@/lib/data";

export default async function OnskelistePage() {
  const [familyMembers, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getWishListItems(),
  ]);

  return (
    <main className="shell wishShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Ønskeliste</h1>
        </div>
      </header>

      <OnskelisteTabs familyMembers={familyMembers} wishListItems={wishListItems} />
    </main>
  );
}

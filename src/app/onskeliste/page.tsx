import { OnskelisteTabs } from "@/components/onskeliste-tabs";
import { SiteHeader } from "@/components/site-header";
import { getFamilyMembers, getWishListItems } from "@/lib/data";

export default async function OnskelistePage() {
  const [familyMembers, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getWishListItems(),
  ]);

  return (
    <main className="shell">
      <SiteHeader current="onskeliste" />

      <section className="sectionHero accentWarmPanel">
        <div>
          <span className="kicker">Ønskeliste</span>
          <h1 style={{ padding: "0.5em 0" }}>Familiens ønskelister</h1>
        </div>
        <div className="sectionBadge">{wishListItems.length} lagrede ønsker</div>
      </section>

      <OnskelisteTabs familyMembers={familyMembers} wishListItems={wishListItems} />
    </main>
  );
}

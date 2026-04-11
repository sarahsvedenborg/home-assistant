import { SiteHeader } from "@/components/site-header";
import { WishlistBrowser } from "@/components/wishlist-browser";
import { getFamilyMembers, getWishListItems } from "@/lib/data";

export default async function WishListPage() {
  const [familyMembers, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getWishListItems(),
  ]);

  return (
    <main className="shell">
      <SiteHeader current="wishlist" />

      <section className="sectionHero accentWarmPanel">
        <div>
          <span className="kicker">Ønskeliste</span>
          <h1 style={{padding: '0.5em 0'}}>Ønskelister</h1>
        {/*  */}
        </div>
        <div className="sectionBadge">{wishListItems.length} lagrede ønsker</div>
      </section>

      <WishlistBrowser familyMembers={familyMembers} wishListItems={wishListItems} />
    </main>
  );
}

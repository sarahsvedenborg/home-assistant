import { EmptyState } from "@/components/empty-state";
import { SiteHeader } from "@/components/site-header";
import { WishlistForm } from "@/components/wishlist-form";
import { getFamilyMembers, getWishListItems, groupWishListByPerson } from "@/lib/data";

export default async function WishListPage() {
  const [familyMembers, wishListItems] = await Promise.all([
    getFamilyMembers(),
    getWishListItems(),
  ]);
  const groupedItems = groupWishListByPerson(wishListItems);

  return (
    <main className="shell">
      <SiteHeader current="wishlist" />

      <section className="sectionHero accentWarmPanel">
        <div>
          <span className="kicker">Wish list</span>
          <h1>Everyone can drop hints, dream big, and save favorite gift ideas.</h1>
          <p>
            Items stay organized by person so birthdays, holidays, and surprise treats feel easier.
          </p>
        </div>
        <div className="sectionBadge">{wishListItems.length} saved wishes</div>
      </section>

      <section className="contentGrid">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>Saved by person</h2>
            <p>Each card shows titles, notes, and links when they are available.</p>
          </div>

          {groupedItems.length === 0 ? (
            <EmptyState
              title="No wishes yet"
              description="Add the first one below and it will show up here."
            />
          ) : (
            <div className="groupStack">
              {groupedItems.map((group) => (
                <section className="groupCard" key={group.person}>
                  <div className="groupHeader">
                    <h3>{group.person}</h3>
                    <span>{group.items.length} idea{group.items.length === 1 ? "" : "s"}</span>
                  </div>

                  <ul className="itemList">
                    {group.items.map((item) => (
                      <li key={item.id} className="itemCard">
                        <div className="itemTitleRow">
                          <strong>{item.title}</strong>
                          <span className="itemMeta">submitted by {item.submittedBy}</span>
                        </div>
                        {item.description ? <p>{item.description}</p> : null}
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noreferrer" className="inlineLink">
                            Open link
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <div id="add-wish">
          <WishlistForm familyMembers={familyMembers.map((member) => member.name)} />
        </div>
      </section>
    </main>
  );
}

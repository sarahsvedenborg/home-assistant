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
          <span className="kicker">Oenskeliste</span>
          <h1>Alle kan legge igjen hint, oenske stort og lagre fine gaveideer.</h1>
          <p>
            Alt holdes sortert per person, saa bursdager, hoeytider og overraskelser blir enklere.
          </p>
        </div>
        <div className="sectionBadge">{wishListItems.length} lagrede oensker</div>
      </section>

      <section className="contentGrid">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>Lagret per person</h2>
            <p>Hvert kort viser navn, notater og lenker naar de finnes.</p>
          </div>

          {groupedItems.length === 0 ? (
            <EmptyState
              title="Ingen oensker enda"
              description="Legg til det foerste oensket under, saa vises det her."
            />
          ) : (
            <div className="groupStack">
              {groupedItems.map((group) => (
                <section className="groupCard" key={group.person}>
                  <div className="groupHeader">
                    <h3>{group.person}</h3>
                    <span>{group.items.length} ide{group.items.length === 1 ? "" : "er"}</span>
                  </div>

                  <ul className="itemList">
                    {group.items.map((item) => (
                      <li key={item.id} className="itemCard">
                        <div className="itemTitleRow">
                          <strong>{item.title}</strong>
                          <span className="itemMeta">lagt til av {item.submittedBy}</span>
                        </div>
                        {item.description ? <p>{item.description}</p> : null}
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noreferrer" className="inlineLink">
                            Aapne lenke
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

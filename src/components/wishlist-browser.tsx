"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { WishlistForm } from "@/components/wishlist-form";
import type { FamilyMember, WishListItem } from "@/lib/types";
import { buildWishListGroupsForFamily } from "@/lib/wishlist";

type WishlistBrowserProps = {
  familyMembers: FamilyMember[];
  wishListItems: WishListItem[];
};

export function WishlistBrowser({ familyMembers, wishListItems }: WishlistBrowserProps) {
  const [selectedMemberName, setSelectedMemberName] = useState(familyMembers[0]?.name || "");

  const itemsByPerson = useMemo(() => {
    return buildWishListGroupsForFamily(familyMembers, wishListItems);
  }, [familyMembers, wishListItems]);

  const activeGroup =
    itemsByPerson.find((group) => group.member.name === selectedMemberName) || itemsByPerson[0];

  if (!activeGroup) {
    return null;
  }

  return (
    <section className="contentGrid">
      <div className="listPanel">
        <div className="panelHeading">
          <h2>Familiemedlemmer</h2>
{/*           <p>Trykk på et kort for å se ønskelisten og legge til et nytt ønske direkte.</p> */}
        </div>

        <div className="familyCardGrid">
          {itemsByPerson.map(({ member, items }) => {
            const isActive = member.name === activeGroup.member.name;

            return (
              <button
                key={member.id}
                type="button"
                className={isActive ? "familyCard familyCardActive" : "familyCard"}
                onClick={() => setSelectedMemberName(member.name)}
              >
                <span className="familyCardTop">
                  <span
                    className="familyCardEmoji"
                    style={member.accentColor ? { backgroundColor: member.accentColor } : undefined}
                  >
                    {member.emoji || "👤"}
                  </span>
                  <span className="familyCardCount">
                    {items.length} ønske{items.length === 1 ? "" : "r"}
                  </span>
                </span>
                <strong>{member.name}</strong>
               {/*  <span>{member.role === "adult" ? "Voksen" : "Barn"}</span> */}
              </button>
            );
          })}
        </div>

        <section className="groupCard groupCardOpen">
          <div className="groupHeader">
            <h3>{activeGroup.member.name}</h3>
            <span>
              {activeGroup.items.length} ønske{activeGroup.items.length === 1 ? "" : "r"}
            </span>
          </div>

          {activeGroup.items.length === 0 ? (
            <EmptyState
              title="Ingen ønsker enda"
              description={`Legg til det foerste ønsket for ${activeGroup.member.name} i skjemaet ved siden av.`}
            />
          ) : (
            <ul className="itemList">
              {activeGroup.items.map((item) => (
                <li key={item.id} className="itemCard">
                  <div className="itemTitleRow">
                    <strong>{item.title}</strong>
                    <span className="itemMeta">lagt til av {item.submittedBy}</span>
                  </div>
                  {item.description ? <p>{item.description}</p> : null}
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className="inlineLink">
                      Åpne lenke
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div id="add-wish">
        <WishlistForm
          familyMembers={familyMembers.map((member) => member.name)}
          selectedMemberName={activeGroup.member.name}
        />
      </div>
    </section>
  );
}

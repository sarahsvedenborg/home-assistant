"use client";

import { useMemo, useState } from "react";

import { WishlistForm } from "@/components/wishlist-form";
import { buildWishListGroupsForFamily } from "@/lib/wishlist";
import type { FamilyMember, WishListItem } from "@/lib/types";

type OnskelisteTabsProps = {
  familyMembers: FamilyMember[];
  wishListItems: WishListItem[];
};

export function OnskelisteTabs({ familyMembers, wishListItems }: OnskelisteTabsProps) {
  const groups = useMemo(
    () => buildWishListGroupsForFamily(familyMembers, wishListItems),
    [familyMembers, wishListItems],
  );
  const [activeMemberName, setActiveMemberName] = useState(groups[0]?.member.name || "");

  const activeGroup = groups.find((group) => group.member.name === activeMemberName) || groups[0];

  if (!activeGroup) {
    return null;
  }

  return (
    <section className="listPanel tabsPanel">
      <div className="tabList" role="tablist" aria-label="Familiemedlemmer">
        {groups.map((group) => {
          const isActive = group.member.name === activeGroup.member.name;

          return (
            <button
              key={group.member.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={isActive ? "tabButton tabButtonActive" : "tabButton"}
              onClick={() => setActiveMemberName(group.member.name)}
            >
              {group.member.name}
            </button>
          );
        })}
      </div>

      <div className="tabPanel" role="tabpanel" aria-label={activeGroup.member.name}>
        <div className="wishTabsContent">
          <div>
            <div className="wishTableHeader">
              <span>Ønske</span>
              <span>Kommentar</span>
            </div>

            {activeGroup.items.length === 0 ? (
              <div className="wishTableEmpty">
                Ingen ønsker registrert for {activeGroup.member.name} ennå.
              </div>
            ) : (
              <div className="wishTableBody">
                {activeGroup.items.map((item) => (
                  <div key={item.id} className="wishTableRow wishTableRowCompact">
                    <div className="wishTitleCell">
                      <strong>{item.title}</strong>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noreferrer" className="wishInlineLink">
                          {item.link}
                        </a>
                      ) : null}
                    </div>
                    <span>{item.description || "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <WishlistForm
            familyMembers={familyMembers.map((member) => member.name)}
            selectedMemberName={activeGroup.member.name}
            submitPath="/api/submissions/onskeliste"
          />
        </div>
      </div>
    </section>
  );
}

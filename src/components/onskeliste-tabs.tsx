"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";

import { AddButton } from "@/components/add-button";
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = Math.max(
    0,
    groups.findIndex((group) => group.member.name === activeMemberName),
  );
  const activeGroup = groups[activeIndex];

  if (!activeGroup) {
    return null;
  }

  function moveToTab(nextIndex: number) {
    const nextGroup = groups[nextIndex];

    if (!nextGroup) {
      return;
    }

    setActiveMemberName(nextGroup.member.name);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = groups.length - 1;
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    } else {
      return;
    }

    event.preventDefault();
    moveToTab(nextIndex);
  }

  return (
    <section className="listStack">
      <div className="listPanel tabsPanel">
        <label className="field tabMemberSelect">
          <span>Viser ønsker for: </span>
          <select
            value={activeGroup.member.name}
            aria-label="Familiemedlem"
            onChange={(event) => setActiveMemberName(event.target.value)}
          >
            {groups.map((group) => (
              <option key={group.member.id} value={group.member.name}>
                {group.member.name}
              </option>
            ))}
          </select>
        </label>

        <div className="tabList" role="tablist" aria-label="Familiemedlemmer">
          {groups.map((group, index) => {
            const isActive = index === activeIndex;
            const panelId = `wish-panel-${group.member.id}`;

            return (
              <button
                key={group.member.id}
                type="button"
                role="tab"
                id={`wish-tab-${group.member.id}`}
                aria-controls={panelId}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={isActive ? "tabButton tabButtonActive" : "tabButton"}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                onClick={() => setActiveMemberName(group.member.name)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                {group.member.name}
              </button>
            );
          })}
        </div>

        <div
          className="tabPanel"
          role="tabpanel"
          id={`wish-panel-${activeGroup.member.id}`}
          aria-label={activeGroup.member.name}
          aria-labelledby={`wish-tab-${activeGroup.member.id}`}
        >
          <div className="wishTabsContent">
            <div>
              <div className="wishTableHeader">
                <span>Ønske</span>
                <span>Kommentar</span>
              </div>

              {activeGroup.items.length === 0 ? (
                <p className="wishTableEmpty">
                  Ingen ønsker registrert for {activeGroup.member.name} ennå.
                </p>
              ) : (
                <ul className="wishTableBody">
                  {activeGroup.items.map((item) => {
                    const comment = item.description?.trim() ?? "";

                    return (
                      <li key={item.id} className="wishTableRow wishTableRowCompact">
                        <div className="wishTitleCell">
                          <strong>{item.title}</strong>
                          {item.link ? (
                            <a href={item.link} target="_blank" rel="noreferrer" className="wishInlineLink">
                              {item.link}
                            </a>
                          ) : null}
                        </div>
                        <span className={comment ? "wishComment" : "wishComment wishCommentEmpty"}>
                          {comment || "-"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddButton title={`Legg til ønske for ${activeGroup.member.name}`} label="Legg til ønske" anchor="add-wish">
        <WishlistForm
          familyMembers={familyMembers.map((member) => member.name)}
          selectedMemberName={activeGroup.member.name}
          submitPath="/api/submissions/onskeliste"
        />
      </AddButton>
    </section>
  );
}

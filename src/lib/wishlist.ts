import type { FamilyMember, FamilyMemberWishListGroup, WishListItem } from "@/lib/types";

const WISH_LINK_DISPLAY_MAX = 80;

export function formatWishLinkLabel(link: string): string {
  if (link.length <= WISH_LINK_DISPLAY_MAX) {
    return link;
  }

  return `${link.slice(0, WISH_LINK_DISPLAY_MAX)}…`;
}

export function buildWishListGroupsForFamily(
  familyMembers: FamilyMember[],
  items: WishListItem[],
): FamilyMemberWishListGroup[] {
  return familyMembers.map((member) => ({
    member,
    items: items.filter((item) => item.submittedBy === member.name),
  }));
}

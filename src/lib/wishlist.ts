import type { FamilyMember, FamilyMemberWishListGroup, WishListItem } from "@/lib/types";

export function buildWishListGroupsForFamily(
  familyMembers: FamilyMember[],
  items: WishListItem[],
): FamilyMemberWishListGroup[] {
  return familyMembers.map((member) => ({
    member,
    items: items.filter((item) => item.submittedBy === member.name),
  }));
}

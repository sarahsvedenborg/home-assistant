import type { FamilyMember, FamilyMemberWishListGroup, WishListItem } from "@/lib/types";

export function formatWishLinkHost(link: string): string | null {
  try {
    const url = new URL(link);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
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

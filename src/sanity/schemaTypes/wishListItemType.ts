import { defineField, defineType } from "sanity";

export const wishListItemType = defineType({
  name: "wishListItem",
  title: "Wish List Item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Notes",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
    }),
    defineField({
      name: "familyMember",
      title: "Family member",
      type: "reference",
      to: [{ type: "familyMember" }],
    }),
    defineField({
      name: "submittedByName",
      title: "Submitted by (fallback)",
      type: "string",
      description: "Used when no family member document is linked yet.",
    }),
    defineField({
      name: "status",
      title: "Approval status",
      type: "string",
      initialValue: "approved",
      options: {
        list: [
          { title: "Approved", value: "approved" },
          { title: "Pending", value: "pending" },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      submittedByName: "submittedByName",
      familyMemberName: "familyMember.name",
      status: "status",
    },
    prepare({ title, submittedByName, familyMemberName, status }) {
      return {
        title,
        subtitle: `${familyMemberName || submittedByName || "Unknown"} - ${status || "approved"}`,
      };
    },
  },
});

import { defineField, defineType } from "sanity";

export const wishListItemType = defineType({
  name: "wishListItem",
  title: "Ønskeliste",
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
      name: "notApplicable",
      title: "Gjelder ikke",
      type: "boolean",
      initialValue: false,
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
      notApplicable: "notApplicable",
    },
    prepare({ title, submittedByName, familyMemberName, status, notApplicable }) {
      return {
        title,
        subtitle: `${familyMemberName || submittedByName || "Unknown"} - ${
          notApplicable ? "gjelder ikke" : status || "approved"
        }`,
      };
    },
  },
});

import { defineField, defineType } from "sanity";

export const familyMemberType = defineType({
  name: "familyMember",
  title: "Family Member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "Adult", value: "adult" },
          { title: "Child", value: "child" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "emoji",
      title: "Emoji",
      type: "string",
      description: "A fun icon to make the hub feel personal.",
    }),
    defineField({
      name: "accentColor",
      title: "Accent color",
      type: "string",
      description: "Optional hex color like #ff9f6e",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      emoji: "emoji",
    },
    prepare({ title, subtitle, emoji }) {
      return {
        title,
        subtitle,
        media: () => emoji || "👤",
      };
    },
  },
});

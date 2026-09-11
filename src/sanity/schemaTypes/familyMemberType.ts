import { defineArrayMember, defineField, defineType } from "sanity";

export const familyMemberType = defineType({
  name: "familyMember",
  title: "Familiemedlem",
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
    defineField({
      name: "chores",
      title: "Chores",
      type: "array",
      of: [
        defineArrayMember({
          name: "assignedChore",
          title: "Chore",
          type: "object",
          fields: [
            defineField({
              name: "chore",
              title: "Chore",
              type: "reference",
              to: [{ type: "chore" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "amount",
              title: "Antall utført",
              type: "number",
              initialValue: 0,
              validation: (rule) => rule.required().integer().min(0),
            }),
          ],
          preview: {
            select: {
              title: "chore.title",
              amount: "amount",
              pay: "chore.pay",
            },
            prepare({ title, amount, pay }) {
              const total =
                typeof amount === "number" && typeof pay === "number" ? amount * pay : 0;

              return {
                title: title || "Chore",
                subtitle: `${amount || 0} ganger · ${total} kr`,
              };
            },
          },
        }),
      ],
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

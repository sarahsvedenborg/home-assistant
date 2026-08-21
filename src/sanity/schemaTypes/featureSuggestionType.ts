import { defineField, defineType } from "sanity";

export const featureSuggestionType = defineType({
  name: "featureSuggestion",
  title: "Feature Suggestion",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().max(1000),
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
      text: "text",
      status: "status",
    },
    prepare({ title, text, status }) {
      return {
        title,
        subtitle: `${status || "approved"}${text ? ` - ${text}` : ""}`,
      };
    },
  },
});

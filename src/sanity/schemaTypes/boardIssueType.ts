import { defineField, defineType } from "sanity";

export const boardIssueType = defineType({
  name: "boardIssue",
  title: "Board issue",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "text",
      title: "Tekst",
      type: "text",
      rows: 4,
      validation: (rule) => rule.max(500),
    }),
    defineField({
      name: "assigned",
      title: "Tildelt",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "todo",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "Må gjøres", value: "todo" },
          { title: "Har begynt", value: "inProgress" },
          { title: "Ferdig", value: "done" },
        ],
        layout: "radio",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      text: "text",
      assigned: "assigned",
      status: "status",
    },
    prepare({ title, text, assigned, status }) {
      return {
        title: title || text || "Uten tittel",
        subtitle: [status || "todo", assigned].filter(Boolean).join(" · "),
      };
    },
  },
});

import { defineField, defineType } from "sanity";

export const choreType = defineType({
  name: "chore",
  title: "Chore",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "text",
      title: "Beskrivelse",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(500),
    }),
    defineField({
      name: "pay",
      title: "Betaling",
      description: "Beløp i kroner per utførelse.",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      title: "title",
      pay: "pay",
    },
    prepare({ title, pay }) {
      return {
        title,
        subtitle: typeof pay === "number" ? `${pay} kr per gang` : "Ingen betaling satt",
      };
    },
  },
});

import { defineField, defineType } from "sanity";

export const dayNoteType = defineType({
  name: "dayNote",
  title: "Dagsnotat",
  type: "document",
  fields: [
    defineField({
      name: "date",
      title: "Startdato",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "Sluttdato",
      description: "Bruker startdatoen når feltet står tomt.",
      type: "date",
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const startDate = context.document?.date;

          return !endDate ||
            typeof startDate !== "string" ||
            endDate >= startDate
            ? true
            : "Sluttdato kan ikke være før startdato.";
        }),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      initialValue: "note",
      options: {
        layout: "radio",
        list: [
          { title: "Notat", value: "note" },
          { title: "Bursdag", value: "birthday" },
          { title: "Ferie", value: "vacation" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Notat",
      type: "string",
      validation: (rule) => rule.required().max(200),
    }),
  ],
  preview: {
    select: {
      title: "text",
      subtitle: "date",
    },
  },
});

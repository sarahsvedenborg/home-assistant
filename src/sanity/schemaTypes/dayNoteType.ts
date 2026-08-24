import { defineField, defineType } from "sanity";

export const dayNoteType = defineType({
  name: "dayNote",
  title: "Dagsnotat",
  type: "document",
  fields: [
    defineField({
      name: "date",
      title: "Dato",
      type: "date",
      validation: (rule) => rule.required(),
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

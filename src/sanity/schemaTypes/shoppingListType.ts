import { defineArrayMember, defineField, defineType } from "sanity";

export const shoppingListType = defineType({
  name: "shoppingList",
  title: "Handleliste",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      initialValue: "Handleliste",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "items",
      title: "Varer",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Vare",
              type: "string",
              validation: (rule) => rule.required().max(100),
            }),
            defineField({
              name: "quantity",
              title: "Mengde",
              type: "string",
            }),
            defineField({
              name: "note",
              title: "Notat",
              type: "string",
            }),
            defineField({
              name: "addedBy",
              title: "Lagt til av",
              type: "string",
            }),
            defineField({
              name: "checked",
              title: "Kjøpt",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "quantity",
              checked: "checked",
            },
            prepare({ title, subtitle, checked }) {
              return {
                title,
                subtitle: `${subtitle || "Ingen mengde"} - ${checked ? "kjøpt" : "mangler"}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      items: "items",
    },
    prepare({ title, items }) {
      return {
        title,
        subtitle: `${items?.length || 0} varer`,
      };
    },
  },
});

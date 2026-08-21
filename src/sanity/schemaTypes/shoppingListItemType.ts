import { defineField, defineType } from "sanity";

export const shoppingListItemType = defineType({
  name: "shoppingListItem",
  title: "Handlevare",
  type: "document",
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
});

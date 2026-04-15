import { defineArrayMember, defineField, defineType } from "sanity";

export const recipeType = defineType({
  name: "recipe",
  title: "Oppskrift",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
    }),
    defineField({
      name: "ingredients",
      title: "Ingredienser",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "steps",
      title: "Steg",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "comments",
      title: "Kommentarer",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "url",
    },
  },
});

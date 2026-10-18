import { HeartIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const favouriteQuoteType = defineType({
  name: "favouriteQuote",
  title: "Sitat",
  type: "object",
  icon: HeartIcon,
  fields: [
    defineField({
      name: "text",
      title: "Sitat",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "author",
      title: "Forfatter",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "savedAt",
      title: "Lagret",
      type: "datetime",
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "text",
      subtitle: "author",
    },
  },
});

export const favouriteQuotesType = defineType({
  name: "favouriteQuotes",
  title: "Favorittsitater",
  type: "document",
  icon: HeartIcon,
  fields: [
    defineField({
      name: "quotes",
      title: "Sitater",
      type: "array",
      of: [defineArrayMember({ type: "favouriteQuote" })],
    }),
  ],
  preview: {
    select: {
      quotes: "quotes",
    },
    prepare({ quotes }) {
      const count = Array.isArray(quotes) ? quotes.length : 0;

      return {
        title: "Favorittsitater",
        subtitle: count === 1 ? "1 sitat" : `${count} sitater`,
      };
    },
  },
});

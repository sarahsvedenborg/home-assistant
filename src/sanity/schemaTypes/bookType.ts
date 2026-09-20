import { defineField, defineType } from "sanity";

export const bookType = defineType({
  name: "book",
  title: "Bok",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "author",
      title: "Forfatter",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "cover",
      title: "Omslag",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alternativ tekst",
          type: "string",
          validation: (rule) => rule.warning("Beskriv omslaget for tilgjengelighet."),
        }),
      ],
    }),
    defineField({
      name: "isbn",
      title: "ISBN",
      type: "string",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) {
            return true;
          }

          const digits = value.replace(/[-\s]/g, "");
          if (/^\d{10}(\d{3})?$/.test(digits)) {
            return true;
          }

          return "ISBN skal være 10 eller 13 siffer";
        }),
    }),
    defineField({
      name: "pageCount",
      title: "Antall sider",
      type: "number",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "publicationYear",
      title: "Utgivelsesår",
      type: "number",
      validation: (rule) => rule.integer().min(1000).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: "originalLanguage",
      title: "Originalspråk",
      type: "string",
    }),
    defineField({
      name: "authorCountry",
      title: "Forfatterens land",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      year: "publicationYear",
      media: "cover",
    },
    prepare({ title, author, year, media }) {
      const details = [author, typeof year === "number" ? String(year) : null]
        .filter(Boolean)
        .join(" · ");

      return {
        title: title || "Bok uten tittel",
        subtitle: details || undefined,
        media,
      };
    },
  },
});

import { defineField, defineType } from "sanity";

export const movieRecommendationType = defineType({
  name: "movieRecommendation",
  title: "Film",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "suitableFor",
      title: "Passer for",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "De voksne", value: "De voksne" },
          { title: "Storbarna", value: "Storbarna" },
          { title: "Med Linnea", value: "Med Linnea" },
          { title: "Hele familien", value: "Hele familien" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      title: "Trailere",
      type: "url",
    }),
  /*   defineField({
      name: "poster",
      title: "Poster image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "posterUrl",
      title: "Poster image URL",
      type: "url",
      description: "Useful for kid-friendly form submissions.",
    }), */
    defineField({
      name: "watched",
      title: "Watched",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      suitableFor: "suitableFor",
      watched: "watched",
      media: "poster",
    },
    prepare({ title, suitableFor, watched, media }) {
      const audience =
        typeof suitableFor === "string" && suitableFor
          ? ` - passer for ${suitableFor}`
          : "";

      return {
        title,
        subtitle: `${watched ? "Sett" : "Ikke sett ennå"}${audience}`,
        media,
      };
    },
  },
});

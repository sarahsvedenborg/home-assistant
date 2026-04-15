import { defineField, defineType } from "sanity";

export const movieRecommendationType = defineType({
  name: "movieRecommendation",
  title: "Movie Recommendation",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "familyMember",
      title: "Suggested by",
      type: "reference",
      to: [{ type: "familyMember" }],
    }),
    defineField({
      name: "suitableFor",
      title: "Passer for",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
    }),
    defineField({
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
    }),
    defineField({
      name: "watched",
      title: "Watched",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "status",
      title: "Approval status",
      type: "string",
      initialValue: "approved",
      options: {
        list: [
          { title: "Approved", value: "approved" },
          { title: "Pending", value: "pending" },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      familyMemberName: "familyMember.name",
      suitableFor: "suitableFor",
      watched: "watched",
      media: "poster",
    },
    prepare({ title, familyMemberName, suitableFor, watched, media }) {
      return {
        title,
        subtitle: `${familyMemberName || "Unknown"} - ${watched ? "watched" : "not watched yet"}${Array.isArray(suitableFor) && suitableFor.length > 0 ? ` - passer for ${suitableFor.join(", ")}` : ""}`,
        media,
      };
    },
  },
});

import { defineArrayMember, defineField, defineType } from "sanity";

const DINNER_CATEGORIES = [
  { title: "Vanlig middag", value: "regular" },
  { title: "Kosemiddag", value: "cozy" },
  { title: "Enkel", value: "simple" },
  { title: "Tur", value: "trip" },
] as const;

export const dinnerType = defineType({
  name: "dinner",
  title: "Middag",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "ingredients",
      title: "Ingredienser",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "day",
      title: "Dag",
      type: "number",
      description: "Plassering i 14-dagersplanen (1–14).",
      validation: (rule) =>
        rule
          .integer()
          .min(1)
          .max(14)
          .custom(async (day, context) => {
            if (day === undefined) {
              return true;
            }

            const documentId = context.document?._id;
            if (!documentId) {
              return true;
            }

            const publishedId = documentId.replace(/^drafts\./, "");
            const draftId = `drafts.${publishedId}`;
            const client = context.getClient({ apiVersion: "2026-04-10" });
            const isUnique = await client.fetch<boolean>(
              `count(*[
                _type == "dinner" &&
                day == $day &&
                !(_id in [$draftId, $publishedId])
              ]) == 0`,
              { day, draftId, publishedId },
            );

            return isUnique || "Denne dagen er allerede brukt av en annen middag.";
          }),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [...DINNER_CATEGORIES],
      },
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      categories: "category",
    },
    prepare({ title, categories }) {
      const categoryLabels = Array.isArray(categories)
        ? categories.map(
            (category) =>
              DINNER_CATEGORIES.find((option) => option.value === category)
                ?.title || category,
          )
        : [];

      return {
        title,
        subtitle:
          categoryLabels.length > 0 ? categoryLabels.join(", ") : undefined,
      };
    },
  },
});

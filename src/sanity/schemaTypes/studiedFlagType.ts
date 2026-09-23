import { defineArrayMember, defineField, defineType } from "sanity";

import { isFlagCode } from "@/lib/flag-codes";

export const studiedFlagType = defineType({
  name: "studiedFlags",
  title: "Studerte flagg",
  type: "document",
  fields: [
    defineField({
      name: "flags",
      title: "Flagg",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "code",
              title: "Landkode",
              type: "string",
              validation: (rule) =>
                rule.required().custom((code) =>
                  typeof code === "string" && isFlagCode(code)
                    ? true
                    : "Bruk en gyldig landkode.",
                ),
            }),
            defineField({
              name: "name",
              title: "Land",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "code",
            },
          },
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: {
      flags: "flags",
    },
    prepare({ flags }) {
      const count = Array.isArray(flags) ? flags.length : 0;
      return {
        title: "Studerte flagg",
        subtitle: `${count} land`,
      };
    },
  },
});

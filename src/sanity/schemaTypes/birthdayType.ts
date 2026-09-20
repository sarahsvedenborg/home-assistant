import { defineField, defineType } from "sanity";

type NameKind = "familyMember" | "custom";

type NameValue = {
  kind?: NameKind;
  familyMember?: { _ref?: string };
  text?: string;
};

function isNameKind(value: unknown): value is NameKind {
  return value === "familyMember" || value === "custom";
}

export const birthdayType = defineType({
  name: "birthday",
  title: "Bursdag",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Navn",
      type: "object",
      fields: [
        defineField({
          name: "kind",
          title: "Type",
          type: "string",
          initialValue: "familyMember",
          options: {
            layout: "radio",
            list: [
              { title: "Familiemedlem", value: "familyMember" },
              { title: "Annet navn", value: "custom" },
            ],
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "familyMember",
          title: "Familiemedlem",
          type: "reference",
          to: [{ type: "familyMember" }],
          hidden: ({ parent }) => (parent as NameValue | undefined)?.kind !== "familyMember",
          validation: (rule) =>
            rule.custom((value, context) => {
              const kind = (context.parent as NameValue | undefined)?.kind;
              return kind === "familyMember" && !value
                ? "Velg et familiemedlem."
                : true;
            }),
        }),
        defineField({
          name: "text",
          title: "Navn",
          type: "string",
          hidden: ({ parent }) => (parent as NameValue | undefined)?.kind !== "custom",
          validation: (rule) =>
            rule.max(80).custom((value, context) => {
              const kind = (context.parent as NameValue | undefined)?.kind;
              return kind === "custom" && !value?.trim()
                ? "Skriv inn et navn."
                : true;
            }),
        }),
      ],
      validation: (rule) =>
        rule.required().custom((value) => {
          const name = value as NameValue | undefined;
          if (!name || !isNameKind(name.kind)) {
            return "Velg om navnet er et familiemedlem eller et fritt navn.";
          }

          return true;
        }),
    }),
    defineField({
      name: "date",
      title: "Bursdag",
      type: "date",
    }),
  ],
  preview: {
    select: {
      memberName: "name.familyMember.name",
      customName: "name.text",
      date: "date",
    },
    prepare({ memberName, customName, date }) {
      return {
        title: memberName || customName || "Bursdag",
        subtitle: typeof date === "string" ? date : "Ingen dato",
        media: () => "🎂",
      };
    },
  },
});

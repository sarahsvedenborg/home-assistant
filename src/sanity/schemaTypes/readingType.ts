import { defineArrayMember, defineField, defineType } from "sanity";

const READING_TYPES = [
  { title: "Selv", value: "self" },
  { title: "Sammen", value: "together" },
  { title: "Lydbok", value: "audiobook" },
  { title: "Lydbok og tekst", value: "audioAndText" },
] as const;

const READING_STATUSES = [
  { title: "Ønsker å lese", value: "wantToRead" },
  { title: "Leser", value: "reading" },
  { title: "Ferdig", value: "finished" },
  { title: "Avbrutt", value: "abandoned" },
] as const;

const readingTypeTitles = Object.fromEntries(
  READING_TYPES.map((item) => [item.value, item.title]),
);
const readingStatusTitles = Object.fromEntries(
  READING_STATUSES.map((item) => [item.value, item.title]),
);

export const readingType = defineType({
  name: "reading",
  title: "Lesing",
  type: "document",
  fields: [
    defineField({
      name: "book",
      title: "Bok",
      type: "reference",
      to: [{ type: "book" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readers",
      title: "Lesere",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "familyMember" }],
        }),
      ],
      validation: (rule) =>
        rule.required().min(1).unique().custom((readers, context) => {
          const readingKind = context.document?.readingType;
          if (readingKind === "together" && (readers?.length ?? 0) < 2) {
            return "Sammen-lesing trenger minst to lesere";
          }

          return true;
        }),
    }),
    defineField({
      name: "readingType",
      title: "Måte",
      type: "string",
      options: {
        list: [...READING_TYPES],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startedAt",
      title: "Startet",
      type: "date",
    }),
    defineField({
      name: "finishedAt",
      title: "Ferdig",
      type: "date",
      validation: (rule) =>
        rule.custom((finishedAt, context) => {
          const startedAt = context.document?.startedAt;
          if (
            typeof startedAt === "string" &&
            typeof finishedAt === "string" &&
            finishedAt < startedAt
          ) {
            return "Sluttdato kan ikke være før startdato";
          }

          return true;
        }),
    }),
    defineField({
      name: "currentPage",
      title: "Nåværende side",
      type: "number",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "wantToRead",
      options: {
        list: [...READING_STATUSES],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Terningkast",
      type: "number",
      validation: (rule) => rule.integer().min(1).max(6),
    }),
    defineField({
      name: "note",
      title: "Notat",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "book.title",
      media: "book.cover",
      status: "status",
      readingType: "readingType",
      reader0: "readers.0.name",
      reader1: "readers.1.name",
      extraReaders: "readers.2.name",
    },
    prepare({ title, media, status, readingType, reader0, reader1, extraReaders }) {
      const readers = [reader0, reader1].filter(Boolean).join(" og ");
      const readerText = extraReaders && readers ? `${readers} m.fl.` : readers;
      const details = [
        readerText,
        typeof readingType === "string" ? readingTypeTitles[readingType] : null,
        typeof status === "string" ? readingStatusTitles[status] : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        title: title || "Lesing uten bok",
        subtitle: details || undefined,
        media,
      };
    },
  },
});

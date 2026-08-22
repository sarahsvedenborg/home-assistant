import { defineField, defineType } from "sanity";

export const singleEventType = defineType({
  name: "singleEvent",
  title: "Single Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "E.g. Dentist appointment, birthday party",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "familyMember",
      title: "Family member",
      type: "reference",
      to: [{ type: "familyMember" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "familyMemberName",
      title: "Family member (fallback)",
      type: "string",
      description: "Used when no family member document is linked yet.",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      description: "The single day this event happens on.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      initialValue: "annet",
      validation: (rule) => rule.required(),
      options: {
        layout: "radio",
        list: [
          { title: "Bursdag", value: "bursdag" },
          { title: "Avtale", value: "avtale" },
          { title: "Tur", value: "tur" },
          { title: "Annet", value: "annet" },
        ],
      },
    }),
    defineField({
      name: "allDay",
      title: "All day",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "time",
      title: "Start time",
      type: "string",
      description: "Optional, e.g. 15:00. Ignored for all-day events.",
    }),
    defineField({
      name: "endTime",
      title: "End time",
      type: "string",
      description: "Optional, e.g. 16:00. Ignored for all-day events.",
    }),
    defineField({
      name: "note",
      title: "Note",
      type: "text",
      rows: 3,
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
      date: "date",
      time: "time",
      familyMemberName: "familyMember.name",
      fallbackName: "familyMemberName",
    },
    prepare({ title, date, time, familyMemberName, fallbackName }) {
      const who = familyMemberName || fallbackName || "Unknown";
      const day = typeof date === "string" ? date.slice(0, 10) : "?";
      return {
        title,
        subtitle: `${day}${time ? ` ${time}` : ""} - ${who}`,
      };
    },
  },
});

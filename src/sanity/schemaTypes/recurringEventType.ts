import { defineField, defineType } from "sanity";

export const recurringEventType = defineType({
  name: "recurringEvent",
  title: "Recurring Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "E.g. Piano lessons, Sports at school",
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
      name: "dayOfWeek",
      title: "Day of week",
      type: "string",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "Mandag", value: "monday" },
          { title: "Tirsdag", value: "tuesday" },
          { title: "Onsdag", value: "wednesday" },
          { title: "Torsdag", value: "thursday" },
          { title: "Fredag", value: "friday" },
          { title: "Lørdag", value: "saturday" },
          { title: "Søndag", value: "sunday" },
        ],
      },
    }),
    defineField({
      name: "time",
      title: "Time",
      type: "string",
      description: "Optional, e.g. 15:00",
    }),
    defineField({
      name: "whatToBring",
      title: "What to bring",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "datetime",
      description: "Optional, when the activity starts running.",
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "datetime",
      description: "Optional, when the activity stops running.",
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
      dayOfWeek: "dayOfWeek",
      time: "time",
      familyMemberName: "familyMember.name",
      fallbackName: "familyMemberName",
    },
    prepare({ title, dayOfWeek, time, familyMemberName, fallbackName }) {
      const who = familyMemberName || fallbackName || "Unknown";
      return {
        title,
        subtitle: `${dayOfWeek || "?"}${time ? ` ${time}` : ""} - ${who}`,
      };
    },
  },
});

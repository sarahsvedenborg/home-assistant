import { defineArrayMember, defineField, defineType } from "sanity";

export const shortMessageType = defineType({
  name: "shortMessage",
  title: "Melding",
  type: "document",
  fields: [
    defineField({
      name: "sender",
      title: "Avsender",
      type: "string",
      description:
        'Navnet på avsenderen. Bruk "parents" for foreldre og "all" for alle.',
    }),
    defineField({
      name: "recipients",
      title: "Mottakere",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "text",
      title: "Melding",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "isRead",
      title: "Lest",
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
        layout: "radio",
      },
    }),
  ],
  preview: {
    select: {
      text: "text",
      sender: "sender",
      recipients: "recipients",
      status: "status",
    },
    prepare({ text, sender, recipients, status }) {
      const recipientText =
        Array.isArray(recipients) && recipients.length > 0 ? recipients.join(", ") : "Ingen";

      return {
        title: text || "Tom melding",
        subtitle: `${sender ? `${sender} → ` : ""}${recipientText} · ${status || "approved"}`,
      };
    },
  },
});

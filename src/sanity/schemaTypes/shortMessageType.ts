import { defineArrayMember, defineField, defineType } from "sanity";

export const shortMessageType = defineType({
  name: "shortMessage",
  title: "Melding",
  type: "document",
  fields: [
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
      recipients: "recipients",
      status: "status",
    },
    prepare({ text, recipients, status }) {
      const recipientText =
        Array.isArray(recipients) && recipients.length > 0 ? recipients.join(", ") : "Ingen";

      return {
        title: text || "Tom melding",
        subtitle: `${recipientText} · ${status || "approved"}`,
      };
    },
  },
});

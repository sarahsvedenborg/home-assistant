import {defineField, defineType} from 'sanity'

export const dailyHoonDok = defineType({
  name: 'dailyHoonDok',
  title: 'Daily Hoon Dok',
  type: 'document',

  fields: [
    defineField({
      name: 'dayOfYear',
      title: 'Day of year',
      type: 'number',
      validation: (Rule) =>
        Rule.required().integer().min(1).max(365),
    }),

    defineField({
      name: 'month',
      title: 'Month',
      type: 'number',
      validation: (Rule) =>
        Rule.required().integer().min(1).max(12),
    }),

    defineField({
      name: 'day',
      title: 'Day',
      type: 'number',
      validation: (Rule) =>
        Rule.required().integer().min(1).max(31),
    }),

    defineField({
      name: 'theme',
      title: 'Theme',
      description: 'Norwegian theme',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'themeEn',
      title: 'Theme (English)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sunMyungMoon',
      title: 'Sun Myung Moon',
      type: 'object',

      fields: [
        defineField({
          name: 'displayText',
          title: 'Text',
          type: 'text',
          rows: 4,
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'textType',
          title: 'Text type',
          type: 'string',
          options: {
            list: [
              {title: 'Paraphrase', value: 'paraphrase'},
              {title: 'Direct quote', value: 'quote'},
            ],
            layout: 'radio',
          },
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'sourceTitle',
          title: 'Source title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'sourceDate',
          title: 'Source date',
          type: 'date',
        }),

        defineField({
          name: 'sourceUrl',
          title: 'Source URL',
          type: 'url',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    defineField({
      name: 'hakJaHan',
      title: 'Hak Ja Han',
      type: 'object',

      fields: [
        defineField({
          name: 'displayText',
          title: 'Text',
          type: 'text',
          rows: 4,
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'textType',
          title: 'Text type',
          type: 'string',
          options: {
            list: [
              {title: 'Paraphrase', value: 'paraphrase'},
              {title: 'Direct quote', value: 'quote'},
            ],
            layout: 'radio',
          },
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'sourceTitle',
          title: 'Source title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'sourceDate',
          title: 'Source date',
          type: 'date',
        }),

        defineField({
          name: 'sourceUrl',
          title: 'Source URL',
          type: 'url',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    defineField({
      name: 'teaching',
      title: 'Teaching',
      type: 'object',

      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'text',
          title: 'Teaching',
          type: 'text',
          rows: 5,
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'textType',
          title: 'Text type',
          type: 'string',
          options: {
            list: [
              {title: 'Summary', value: 'summary'},
              {title: 'Paraphrase', value: 'paraphrase'},
              {title: 'Direct quote', value: 'quote'},
            ],
            layout: 'radio',
          },
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'sourceTitle',
          title: 'Source title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),

        defineField({
          name: 'sourceUrl',
          title: 'Source URL',
          type: 'url',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    defineField({
      name: 'reflection',
      title: 'Reflection',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'editorialNote',
      title: 'Editorial note',
      description:
        'Internal note. This should normally not be displayed on the family screen.',
      type: 'text',
      rows: 3,
    }),
  ],

  preview: {
    select: {
      day: 'day',
      month: 'month',
      theme: 'theme',
    },

    prepare({day, month, theme}) {
      return {
        title: `${day}.${month}. – ${theme}`,
        subtitle: 'Daily Hoon Dok',
      }
    },
  },

  orderings: [
    {
      title: 'Calendar order',
      name: 'calendarOrder',
      by: [{field: 'dayOfYear', direction: 'asc'}],
    },
  ],
})
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      image: image(),
      imageAlt: z.string(),
      description: z.string().optional(),
      // Transform string to Date object
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      discussion: z.number(),
      tags: z.array(z.string()),
    }),
});

export const collections = { blog };

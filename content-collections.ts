import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import { compileMDX } from "@content-collections/mdx";
import { remarkMdxPlayground } from "./mdx";

const posts = defineCollection({
  name: "posts",
  directory: "posts",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkMdxPlayground],
    });
    return {
      ...document,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [posts],
});

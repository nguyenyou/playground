import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import { compileMDX } from "@content-collections/mdx";
import { playgroundRemarkPlugin } from "./playgroundRemarkPlugin";

const posts = defineCollection({
  name: "posts",
  directory: "posts",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [playgroundRemarkPlugin],
    });
    const slug = document.title.toLowerCase().replace(/ /g, "-");
    return {
      ...document,
      mdx,
      slug,
    };
  },
});

export default defineConfig({
  collections: [posts],
});

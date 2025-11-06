import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { z } from 'zod'
import { remarkPlayground } from './plugins/playground'
import { createScalaJSPlaygroundPlugin } from './plugins/playground/remark-scalajs-playground'

const posts = defineCollection({
  name: 'posts',
  directory: 'posts',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [
        // First process ScalaJS preview blocks
        createScalaJSPlaygroundPlugin({
          defaultTemplate: 'laminar',
          autoImports: true
        }),
        // Then process regular playground blocks
        remarkPlayground
      ],
    })
    const slug = document.title.toLowerCase().replace(/ /g, '-')
    return {
      ...document,
      mdx,
      slug,
    }
  },
})

export default defineConfig({
  collections: [posts],
})

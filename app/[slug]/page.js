import { MDXContent } from '@content-collections/mdx/react'
import { allPosts } from 'content-collections'
import { Playground } from './Playground'

export default async function PostPage({ params }) {
  const { slug } = await params
  const post = allPosts.find((post) => post.slug === slug)

  return (
    <>
      <article>
        <MDXContent
          code={post.mdx}
          components={{
            Playground,
          }}
        />
      </article>
    </>
  )
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = allPosts.find((post) => post.slug === slug)
  return {
    title: post.title,
  }
}

import { MDXContent } from '@content-collections/mdx/react'
import { allPosts } from 'content-collections'
import { Playground } from '@/components/Playground/Playground'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = allPosts.find((post) => post.slug === slug)

  return (
    <>
      <article>
        <MDXContent
          code={post?.mdx || ''}
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

type MetadataProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: MetadataProps) {
  const { slug } = await params
  const post = allPosts.find((post) => post.slug === slug)
  return {
    title: post?.title || '',
  }
}

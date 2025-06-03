import { MDXContent } from "@content-collections/mdx/react";
import { allPosts } from "content-collections";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { Playground } from "./Playground";
import { ReactPlayground } from "./ReactPlayground";

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = allPosts.find((post) => post._meta.path === slug);
  
  return (
    <>
      <article>
        <MDXContent code={post.mdx} components={{
          Playground: Playground,
          ReactPlayground: ReactPlayground,
        }}/>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post._meta.path }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = allPosts.find((post) => post._meta.path === slug);
  return {
    title: post.title,
  };
}

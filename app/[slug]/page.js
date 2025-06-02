import { readdir, readFile } from "fs/promises";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import matter from "gray-matter";
import { remarkMdxPlayground } from "./mdx";
import { Playground } from "./Playground";

export default async function PostPage({ params }) {
  const { slug } = await params;
  const filename = "./public/" + slug + "/index.md";
  const file = await readFile(filename, "utf8");
  
  const { content, data } = matter(file);
  return (
    <>
      <article>
        <h1>{data.title}</h1>
        <p>
          {new Date(data.date).toLocaleDateString("en", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <MDXRemote
          components={{
            Playground,
          }}
          source={content}
          options={{
            mdxOptions: {
              useDynamicImport: true,
              remarkPlugins: [remarkMdxPlayground],
            },
          }}
        />
      </article>
    </>
  );
}

export async function generateStaticParams() {
  const entries = await readdir("./public/", { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return dirs.map((dir) => ({ slug: dir }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const file = await readFile("./public/" + slug + "/index.md", "utf8");
  let { data } = matter(file);
  return {
    title: data.title,
    description: data.spoiler,
  };
}

import Link from "./Link";
import { allPosts } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";
import { Playground } from "./[slug]/Playground";
import { ReactPlayground } from "./[slug]/ReactPlayground";

function Posts() {
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post._meta.path}>
          <a href={`/posts/${post._meta.path}`}>
            <h3>{post.title}</h3>
            <MDXContent code={post.mdx} components={{
              Playground: Playground,
              ReactPlayground: ReactPlayground,
            }}/>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function Home() {
  return (
    <div className="">
      <Link href="/hello-world">
        Hello Worldddd
      </Link>
      <Posts />
    </div>
  );
}

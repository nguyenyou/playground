import { allPosts } from "content-collections";
import Link from "next/link";

function Posts() {
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.slug}>
          <Link href={`/${post.slug}`}>
            <h3>{post.title}</h3>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function Home() {
  return (
    <div className="">
      <Posts />
    </div>
  );
}

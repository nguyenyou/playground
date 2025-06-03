import { allPosts } from "content-collections";
import Link from "next/link";

function Posts() {
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post._meta.path}>
          <Link href={`/posts/${post._meta.path}`}>
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

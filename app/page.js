import Link from "./Link";
import { metadata, getPosts } from "./posts";

export { metadata };

export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="">
      {posts.map((post) => (
        <Link
          key={post.slug}
          className=""
          href={"/" + post.slug + "/"}
        >
          <article>
            <PostTitle post={post} />
            <PostMeta post={post} />
            <PostSubtitle post={post} />
          </article>
        </Link>
      ))}
    </div>
  );
}

function PostTitle({ post }) {
  return <h2>{post.title}</h2>;
}

function PostMeta({ post }) {
  return (
    <p className="text-[13px] text-gray-700 dark:text-gray-300">
      {new Date(post.date).toLocaleDateString("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </p>
  );
}

function PostSubtitle({ post }) {
  return <p className="mt-1">{post.spoiler}</p>;
}

import Link from 'next/link';
import { db } from '@/lib/db';

export default async function BlogIndexPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          My Blog
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Thoughts, stories, and ideas.
        </p>
      </header>

      <div className="space-y-12">
        {posts.map((post) => (
          <article key={post.id} className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold leading-tight text-gray-900 hover:text-indigo-600 transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              <div className="text-sm text-gray-500">
                <time dateTime={post.createdAt.toISOString()}>
                  {post.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
            <div className="prose max-w-none text-gray-500">
              {post.excerpt}
            </div>
            <div className="text-base font-medium">
              <Link href={`/blog/${post.slug}`} className="text-indigo-600 hover:text-indigo-500">
                Read more &rarr;
              </Link>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="text-center text-gray-500">
            No posts yet. Check back later!
          </p>
        )}
      </div>
    </div>
  );
}

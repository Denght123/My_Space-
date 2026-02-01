import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

import CommentForm from './comment-form';

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!params.slug) {
    notFound();
  }

  const post = await db.post.findUnique({
    where: { slug: params.slug },
    include: {
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post || (!post.published)) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
          {post.title}
        </h1>
        <div className="flex items-center text-gray-500 text-sm">
          <time dateTime={post.createdAt.toISOString()}>
            {post.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {post.category && (
            <>
              <span className="mx-2">&middot;</span>
              <span>{post.category}</span>
            </>
          )}
        </div>
      </header>

      <div className="prose prose-lg prose-indigo max-w-none">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <hr className="my-12 border-gray-200" />

      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Comments ({post.comments.length})</h3>
        
        <div className="mb-10">
          <CommentForm postId={post.id} slug={post.slug} />
        </div>

        <div className="space-y-8">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-lg">
                    {comment.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="text-sm font-medium text-gray-900">
                  {comment.nickname}
                  {comment.isAdmin && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800">
                      Author
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {comment.createdAt.toLocaleDateString()}
                </div>
                <div className="text-gray-700">
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
          
          {post.comments.length === 0 && (
            <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </section>
    </article>
  );
}

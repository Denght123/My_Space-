import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  // 从数据库获取最新的 3 篇已发布文章
  const latestPosts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  return (
    <div className="space-y-12 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to MySpace
        </h1>
        <p className="text-lg text-gray-600 max-w-[600px] mx-auto">
          这里是我的个人极简博客。分享技术、生活与思考。
        </p>
        <div className="pt-4">
          <Link 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            浏览所有文章
          </Link>
        </div>
      </section>

      {/* Latest Posts Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">最新文章</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <article key={post.id} className="flex flex-col border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                <div className="text-sm text-gray-500 mb-4">
                  {post.createdAt.toLocaleDateString('zh-CN')}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                  {post.excerpt || '暂无摘要...'}
                </p>
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-auto"
                >
                  阅读全文 <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {latestPosts.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
            <p className="text-gray-500">
              暂时还没有文章，请先登录后台发布一篇吧！
            </p>
            <Link href="/login" className="text-indigo-600 hover:underline mt-2 inline-block">
              去后台登录
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

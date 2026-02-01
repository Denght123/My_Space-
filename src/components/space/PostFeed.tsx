import { db } from "@/lib/db";
import { auth } from "@/auth";
import PostCard from "./PostCard";

export default async function PostFeed() {
  const session = await auth();
  
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: true },
      },
      likes: {
        where: { userId: session?.user?.id },
        select: { userId: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Create Post Input Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
        <input 
          type="text" 
          placeholder="分享你的新鲜事..." 
          className="flex-1 bg-gray-50 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-not-allowed"
          disabled
        />
      </div>

      {/* Feed */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUser={session?.user} />
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
          暂时没有动态
        </div>
      )}
    </div>
  );
}

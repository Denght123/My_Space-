import { db } from "@/lib/db";
import { auth } from "@/auth";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";

export default async function PostFeed() {
  const session = await auth();
  
  // 获取当前用户名
  const username = session?.user?.name || "匿名用户";

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
      comments: {
        orderBy: { createdAt: "desc" },
        take: 3, // Initial comments to load
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Create Post Input */}
      <CreatePost user={session?.user} authorName={username} />

      {/* Feed */}
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUser={session?.user} 
          authorName={username} // Pass the username
        />
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
          暂时没有动态
        </div>
      )}
    </div>
  );
}

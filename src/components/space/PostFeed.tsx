import { db } from "@/lib/db";
import { auth } from "@/auth";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";

export default async function PostFeed({ userId }: { userId?: string }) {
  const session = await auth();
  
  // If userId is provided, show posts for that user. Otherwise show current user's posts.
  const targetUserId = userId || session?.user?.id;
  const isOwnProfile = session?.user?.id === targetUserId;

  // Fetch current user details to get latest avatar (for CreatePost)
  let userAvatar = null;
  if (session?.user?.id) {
    const user = await db.user.findUnique({ 
      where: { id: session.user.id },
      select: { avatarUrl: true } 
    });
    userAvatar = user?.avatarUrl;
  }
  
  const username = session?.user?.name || "匿名用户";

  const posts = await db.post.findMany({
    where: { 
      published: true,
      authorId: targetUserId // Filter by target user
    },
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
        take: 3, 
      },
      author: { // Include author info
        select: {
          username: true,
          nickname: true,
          avatarUrl: true
        }
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Create Post Input - Only show on own profile */}
      {isOwnProfile && (
        <CreatePost user={session?.user} authorName={username} avatarUrl={userAvatar} />
      )}

      {/* Feed */}
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUser={session?.user} 
          // Prefer nickname, then username, then default
          authorName={post.author?.nickname || post.author?.username || "匿名用户"} 
          authorAvatar={post.author?.avatarUrl} // Pass author avatar
          isOwnProfile={isOwnProfile}
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

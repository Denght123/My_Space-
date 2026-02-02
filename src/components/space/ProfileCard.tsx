import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Mail, MapPin, Link as LinkIcon, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/space/actions";
import Link from "next/link";
import CopyableItem from "./CopyableItem";
import FollowStats from "./sidebar/FollowStats";
import FollowButton from "./FollowButton";

export default async function ProfileCard({ userId }: { userId?: string }) {
  const session = await auth();
  
  // If userId is provided, fetch that user. Otherwise fetch current session user.
  const targetUserId = userId || session?.user?.id;

  if (!targetUserId) {
    return <div className="p-4 bg-white rounded-xl shadow-sm border text-center">请先登录</div>;
  }

  // Fetch user data directly
  const user = await db.user.findUnique({ where: { id: targetUserId } });
  
  // Determine if this is the current user's own profile
  const isOwnProfile = session?.user?.id === targetUserId;
  
  const social = user?.socialLinks ? JSON.parse(user.socialLinks) : { github: "", email: "" };
  
  const displayName = user?.nickname || user?.username || "未登录";
  const avatarUrl = user?.avatarUrl || "https://github.com/shadcn.png";
  const slogan = user?.slogan || "请写入你的个性签名...";
  const location = user?.location || "中国 上海";

  // Fetch aggregated stats for the user
  const [postCount, likeCount] = await Promise.all([
    db.post.count({ where: { authorId: targetUserId } }),
    db.post.aggregate({
      where: { authorId: targetUserId },
      _sum: { likeCount: true }
    })
  ]);

  const totalLikes = likeCount._sum.likeCount || 0;
  
  // Fetch follow status
  let isFollowing = false;
  if (session?.user?.id && !isOwnProfile) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });
    isFollowing = !!follow;
  }

  return (
    <div className="space-y-6 md:sticky md:top-24">
      {/* Main Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 relative">
          {isOwnProfile && (
            <Link href="/space/edit" className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors" title="编辑资料">
              <Edit className="w-4 h-4" />
            </Link>
          )}
          <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-md">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500 mt-1">{slogan}</p>
          </div>
        </div>
        
        {/* Stats - Reverted to 2 cols (Posts, Likes) */}
        <div className="grid grid-cols-2 gap-2 text-center py-4 border-y border-gray-100">
          <div>
            <div className="font-bold text-gray-900">{postCount}</div>
            <div className="text-xs text-gray-500">文章</div>
          </div>
          <div>
            <div className="font-bold text-gray-900">{totalLikes}</div>
            <div className="text-xs text-gray-500">获赞</div>
          </div>
        </div>

        {/* Action Button (Follow/Edit) */}
        {!isOwnProfile && (
          <FollowButton userId={targetUserId} isFollowing={isFollowing} />
        )}

        {/* Info */}
        <div className="space-y-4 pt-2">
          {/* About Me Section */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-1">简介</h3>
            <p className="line-clamp-4 leading-relaxed">
              {user?.aboutMe || "这位博主很懒，还没有填写简介..."}
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{location}</span>
            </div>
            
            {/* Social Links */}
            <CopyableItem icon="github" value={social.github} label="GitHub地址" />
            <CopyableItem icon="email" value={social.email} label="邮箱地址" />
          </div>

          {/* Logout Button - Only show on own profile */}
          {isOwnProfile && (
            <form action={logout}>
              <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 gap-2">
                <LogOut className="w-4 h-4" />
                退出登录
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* New Follow Stats Widget - Separate Card */}
      <FollowStats userId={targetUserId} />
    </div>
  );
}

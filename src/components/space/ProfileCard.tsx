import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Mail, MapPin, Link as LinkIcon, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/space/actions";
import Link from "next/link";

export default async function ProfileCard() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div className="p-4 bg-white rounded-xl shadow-sm border text-center">请先登录</div>;
  }

  // Fetch user data directly
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  
  const social = user?.socialLinks ? JSON.parse(user.socialLinks) : { github: "#", email: "mailto:example@com" };
  
  const displayName = user?.nickname || user?.username || "未登录";
  const avatarUrl = user?.avatarUrl || "https://github.com/shadcn.png";
  const slogan = user?.slogan || "全栈开发者";
  const location = user?.location || "中国 上海";

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 md:sticky md:top-24">
      {/* Header */}
      <div className="text-center space-y-3 relative">
        <Link href="/space/edit" className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors" title="编辑资料">
          <Edit className="w-4 h-4" />
        </Link>
        <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-md">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
          <p className="text-sm text-gray-500 mt-1">{slogan}</p>
        </div>
      </div>

      {/* Stats - Initialize to 0 */}
      <div className="grid grid-cols-3 gap-2 text-center py-4 border-y border-gray-100">
        <div>
          <div className="font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500">文章</div>
        </div>
        <div>
          <div className="font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500">获赞</div>
        </div>
        <div>
          <div className="font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500">访问</div>
        </div>
      </div>

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
        </div>

        {/* Logout Button */}
        <form action={logout}>
          <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 gap-2">
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </form>
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Mail, MapPin, Link as LinkIcon, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/space/actions";
import Link from "next/link";

export default async function ProfileCard() {
  const session = await auth();
  const config = await db.siteConfig.findUnique({ where: { id: 1 } });
  
  const social = config?.socialLinks ? JSON.parse(config.socialLinks) : { github: "#", email: "mailto:example@com" };
  
  // 优先显示当前登录的用户名，如果没有则显示配置的昵称
  const displayName = session?.user?.name || session?.user?.email || config?.nickname || "未登录";

  const avatarUrl = config?.avatarUrl || "https://github.com/shadcn.png";
  const slogan = config?.slogan || "全栈开发者";

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
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>中国 上海</span>
          </div>
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-gray-400" />
            <a href={social.github} target="_blank" className="hover:text-blue-600 transition-colors">GitHub</a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={social.email} className="hover:text-blue-600 transition-colors">发送邮件</a>
          </div>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gray-400" />
            <a href="#" className="hover:text-blue-600 transition-colors">个人作品集</a>
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

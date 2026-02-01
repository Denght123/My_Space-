import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Github, Mail, MapPin, Link as LinkIcon } from "lucide-react";

export default async function ProfileCard() {
  const config = await db.siteConfig.findUnique({ where: { id: 1 } });
  
  // Parse JSON strings (safely)
  const skills = config?.skills ? JSON.parse(config.skills) : ["React", "Next.js", "TypeScript", "Node.js", "TailwindCSS"];
  const social = config?.socialLinks ? JSON.parse(config.socialLinks) : { github: "#", email: "mailto:example@com" };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 sticky top-24">
      {/* Header */}
      <div className="text-center space-y-3">
        <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-md">
          <AvatarImage src={config?.avatarUrl || "https://github.com/shadcn.png"} />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{config?.nickname || "我的名字"}</h2>
          <p className="text-sm text-gray-500 mt-1">{config?.slogan || "Full Stack Developer"}</p>
        </div>
      </div>

      {/* Stats (Placeholder for now) */}
      <div className="grid grid-cols-3 gap-2 text-center py-4 border-y border-gray-100">
        <div>
          <div className="font-bold text-gray-900">12</div>
          <div className="text-xs text-gray-500">文章</div>
        </div>
        <div>
          <div className="font-bold text-gray-900">1.2k</div>
          <div className="text-xs text-gray-500">获赞</div>
        </div>
        <div>
          <div className="font-bold text-gray-900">348</div>
          <div className="text-xs text-gray-500">访问</div>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">技能栈</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill: string) => (
            <Badge key={skill} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 text-sm text-gray-600 pt-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>Shanghai, China</span>
        </div>
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-gray-400" />
          <a href={social.github} target="_blank" className="hover:text-blue-600 transition-colors">Github</a>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <a href={social.email} className="hover:text-blue-600 transition-colors">Email Me</a>
        </div>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-gray-400" />
          <a href="#" className="hover:text-blue-600 transition-colors">Portfolio</a>
        </div>
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditProfileForm from "@/components/space/EditProfileForm";
import PasswordChangeDialog from "@/components/space/PasswordChangeDialog";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    // Redirect or show error if not logged in
    return <div className="p-8 text-center">请先登录</div>;
  }

  // Fetch current user data
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  
  // Safe parsing
  const social = user?.socialLinks ? JSON.parse(user.socialLinks) : { github: "", email: "" };
  
  // Prepare config object for form (adapting to new user schema)
  const config = {
    avatarUrl: user?.avatarUrl,
    nickname: user?.nickname || user?.username, // Fallback to username
    slogan: user?.slogan,
    aboutMe: user?.aboutMe,
  };
  
  // Pass location separately or in social
  const socialWithLocation = { ...social, location: user?.location };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/space">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">编辑资料</h1>
              <p className="text-sm text-gray-500">管理你的个人信息和展示内容</p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <PasswordChangeDialog />
          </div>
        </div>

        <EditProfileForm config={config} social={socialWithLocation} />
      </div>
    </div>
  );
}

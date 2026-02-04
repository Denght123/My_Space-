"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "请先登录" };
  }

  try {
    const nickname = formData.get("nickname") as string;
    const slogan = formData.get("slogan") as string;
    const aboutMe = formData.get("aboutMe") as string;
    const github = formData.get("github") as string;
    const email = formData.get("email") as string;
    const location = formData.get("location") as string; 
    
    // We expect the frontend to handle upload and pass the final URL
    // If no new file, it passes the old URL.
    const avatarUrl = formData.get("avatarUrl") as string;

    // Construct socialLinks JSON
    const socialLinks = JSON.stringify({
      github,
      email,
    });

    // Update User Profile
    await db.user.update({
      where: { id: session.user.id },
      data: {
        nickname,
        slogan,
        aboutMe,
        avatarUrl,
        socialLinks,
        location,
      },
    });

    revalidatePath("/space");
    revalidatePath("/space/edit");
    
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "保存失败" };
  }
}

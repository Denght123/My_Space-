"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

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
    const location = formData.get("location") as string; // Currently not in DB, we'll store in socialLinks or extend DB
    const avatarFile = formData.get("avatarFile") as File;

    let avatarUrl = formData.get("avatarUrl") as string;

    // Handle File Upload
    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const filename = `avatar-${Date.now()}${path.extname(avatarFile.name)}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
      try {
        await writeFile(path.join(uploadDir, filename), buffer);
        avatarUrl = `/uploads/${filename}`;
      } catch (e) {
        console.error("File write error:", e);
        return { error: "图片上传失败" };
      }
    }

    // Construct socialLinks JSON
    const socialLinks = JSON.stringify({
      github,
      email,
    });

    // Update User Profile (Multi-user support)
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

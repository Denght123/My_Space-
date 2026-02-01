"use server";

import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function uploadFile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Create unique filename
    const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.name)}`;
    
    // Ensure upload dir exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });
    
    await writeFile(path.join(uploadDir, filename), buffer);
    const url = `/uploads/${filename}`;

    // Optional: Record in DB immediately or wait for post creation
    // For now, we return the URL for frontend preview/insertion
    
    return { success: true, url, filename, type: file.type };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Upload failed" };
  }
}

"use server";

import { auth } from "@/auth";
import { put } from "@vercel/blob";

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
    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN, 
      addRandomSuffix: true, // Fix: Prevent filename conflicts
    });

    return { success: true, url: blob.url, filename: file.name, type: file.type };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Upload failed: " + (error as Error).message };
  }
}

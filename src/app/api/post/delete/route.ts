import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    // Verify ownership (optional but recommended)
    // const post = await db.post.findUnique({ where: { id: postId } });
    // if (post?.authorId !== session.user.id) { ... }

    await db.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

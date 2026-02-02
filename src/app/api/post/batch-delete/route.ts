import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postIds } = await request.json();
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: "No post IDs provided" }, { status: 400 });
    }

    // Verify ownership of ALL posts to be deleted
    // Or just filter delete by authorId to be safe
    
    const result = await db.post.deleteMany({
      where: {
        id: { in: postIds },
        authorId: session.user.id // Security enforcement: only delete own posts
      },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json({ error: "Failed to delete posts" }, { status: 500 });
  }
}

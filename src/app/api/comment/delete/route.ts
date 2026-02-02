"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await request.json();
    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
    }

    // Check ownership
    // 1. Comment author can delete their own comment
    // 2. Post author can delete any comment on their post
    
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: { post: { select: { authorId: true } } }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify permission: Current user is comment author OR post author
    const isCommentAuthor = comment.nickname === session.user.name; // Nickname based check (legacy) or we should check userId if we had it
    // Wait, Comment model doesn't have userId yet, it uses nickname.
    // However, for authenticated users in Space, we should ideally check against session username.
    // BUT the stronger check is: Is current user the author of the POST?
    
    const isPostAuthor = comment.post.authorId === session.user.id;

    // For now, let's allow Post Author to delete any comment (moderation)
    // And allow Comment Author (if names match) to delete.
    
    if (!isPostAuthor && comment.nickname !== session.user.name) {
       return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

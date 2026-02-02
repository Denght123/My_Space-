"use server";

import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "请先登录" };
  }

  const content = formData.get("content") as string;
  if (!content || !content.trim()) {
    return { error: "内容不能为空" };
  }

  try {
    // Generate a slug from timestamp
    const slug = `post-${Date.now()}`;
    
    await db.post.create({
      data: {
        title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
        content: content,
        slug: slug,
        published: true,
        // Associate with current user
        authorId: session.user.id, 
      }
    });

    revalidatePath("/space");
    return { success: true };
  } catch (error) {
    console.error("Create post error:", error);
    return { error: "发布失败" };
  }
}

export async function createComment(formData: FormData) {
  const postId = formData.get("postId") as string;
  const content = formData.get("content") as string;
  const nickname = formData.get("nickname") as string || "访客";

  if (!content || !content.trim()) {
    return { error: "内容不能为空" };
  }

  try {
    const newComment = await db.comment.create({
      data: {
        postId,
        content,
        nickname,
        isApproved: true, // Auto-approve for now in Space
      }
    });

    revalidatePath("/space");
    return { success: true, comment: newComment };
  } catch (error) {
    console.error("Comment error:", error);
    return { error: "评论失败" };
  }
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function toggleLike(postId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "请先登录" };
  }

  const userId = session.user.id;

  try {
    // Check if user already liked the post
    const existingLike = await db.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Un-like: Delete record and decrement count
      await db.$transaction([
        db.like.delete({
          where: {
            id: existingLike.id,
          },
        }),
        db.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
    } else {
      // Like: Create record and increment count
      await db.$transaction([
        db.like.create({
          data: {
            postId,
            userId,
          },
        }),
        db.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
    }

    revalidatePath("/space");
    return { success: true };
  } catch (error) {
    console.error("Like error:", error);
    return { error: "操作失败" };
  }
}

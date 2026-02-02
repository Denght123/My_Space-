import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: { id: existingFollow.id },
      });
      return NextResponse.json({ success: true, isFollowing: false });
    } else {
      // Follow
      await db.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      });
      return NextResponse.json({ success: true, isFollowing: true });
    }
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

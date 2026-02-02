import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // Get list of users that this userId is following
    const following = await db.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const followingUsers = following.map(f => f.following);

    return NextResponse.json({ following: followingUsers });
  } catch (error) {
    console.error("Fetch following error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

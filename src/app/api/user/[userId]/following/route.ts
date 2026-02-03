import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    
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

    // Simple filter: Just remove the user themselves if they appear (which shouldn't happen usually)
    const followingUsers = following
      .map(f => f.following)
      .filter(u => u.id !== userId);

    return NextResponse.json({ following: followingUsers });
  } catch (error) {
    console.error("Fetch following error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    // Auto-clean: Delete notifications older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    await db.notification.deleteMany({
      where: {
        createdAt: { lt: threeDaysAgo }
      }
    });

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to recent 20
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatarUrl: true,
          }
        },
        post: {
          select: {
            id: true,
            slug: true,
            content: true,
            author: { // Need author username for redirect URL
              select: { username: true }
            }
          }
        },
        comment: {
          select: {
            id: true, // Need comment ID for anchor
            content: true,
          }
        }
      }
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

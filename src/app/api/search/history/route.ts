import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// GET: Fetch recent search history (last 3 days)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ history: [] }); // Empty for guests
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const history = await db.searchHistory.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: threeDaysAgo } // Only recent
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Fetch history error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST: Add or update search history
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false }); // Ignore guests
    }

    const { query } = await request.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    // Upsert: Create if not exists, update createdAt if exists
    await db.searchHistory.upsert({
      where: {
        userId_query: {
          userId: session.user.id,
          query: query,
        }
      },
      update: { createdAt: new Date() },
      create: {
        userId: session.user.id,
        query: query,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add history error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE: Remove a specific history item
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.searchHistory.delete({
      where: {
        id: id,
        userId: session.user.id, // Ensure ownership
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

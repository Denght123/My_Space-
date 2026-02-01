import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: { username: query },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
      }
    });

    if (!user) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, user });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

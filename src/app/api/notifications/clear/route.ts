import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.notification.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear notifications error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

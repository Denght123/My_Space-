import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "原密码不能为空"),
  newPassword: z.string().min(6, "新密码至少 6 位"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = PasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Fetch user with password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return NextResponse.json({ error: "原密码错误" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json({ error: "修改密码失败" }, { status: 500 });
  }
}

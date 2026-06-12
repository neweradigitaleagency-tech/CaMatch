import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role required" }, { status: 400 });
    }

    const newRole = role === "pro" ? "PROFESSIONAL" : "CLIENT" as const;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        phone: updated.phone,
        role: updated.role,
        firstName: updated.profile?.firstName || "",
        lastName: updated.profile?.lastName || "",
        avatarUrl: updated.profile?.avatarUrl || null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}

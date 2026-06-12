import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabaseId, phone, role, firstName, lastName } = body;

    if (!supabaseId) {
      return NextResponse.json({ error: "supabaseId required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id: supabaseId },
      include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });

    if (existing) {
      return NextResponse.json({
        user: {
          id: existing.id,
          phone: existing.phone,
          role: existing.role,
          firstName: existing.profile?.firstName || "",
          lastName: existing.profile?.lastName || "",
          avatarUrl: existing.profile?.avatarUrl || null,
        },
      });
    }

    const userRole = role === "pro" ? "PROFESSIONAL" : "CLIENT" as const;
    const created = await prisma.user.create({
      data: {
        id: supabaseId,
        phone: phone || "",
        role: userRole,
        status: "ACTIVE",
        profile: {
          create: {
            firstName: firstName || phone?.slice(-4) || "Utilisateur",
            lastName: lastName || "",
            profession: userRole === "PROFESSIONAL" ? "Prestataire" : null,
            bio: null,
            zone: [],
            trustScore: 100,
            badge: "NONE",
            onboardingCompleted: false,
          },
        },
      },
      include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });

    return NextResponse.json({
      user: {
        id: created.id,
        phone: created.phone,
        role: created.role,
        firstName: created.profile?.firstName || "",
        lastName: created.profile?.lastName || "",
        avatarUrl: created.profile?.avatarUrl || null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}

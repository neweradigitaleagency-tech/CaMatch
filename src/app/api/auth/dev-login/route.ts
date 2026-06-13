import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function encodeUserCookie(data: object): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();
    const isPro = role === "pro";
    const phone = isPro ? "+2250000000002" : "+2250000000001";

    const user = await prisma.user.upsert({
      where: { phone },
      update: { role: isPro ? "PROFESSIONAL" : "CLIENT", status: "ACTIVE" },
      create: {
        phone,
        role: isPro ? "PROFESSIONAL" : "CLIENT",
        status: "ACTIVE",
        profile: {
          create: {
            firstName: isPro ? "Kouamé" : "Ahou",
            lastName: isPro ? "Jean" : "Mireille",
            zone: ["Cocody"],
            trustScore: isPro ? 847 : 100,
            badge: isPro ? "GOLD" : "NONE",
            isVerified: isPro,
            onboardingCompleted: true,
            isAvailable: isPro,
            profession: isPro ? "Électricien" : null,
          },
        },
      },
      include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });

    const cookieData = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      avatarUrl: user.profile?.avatarUrl || null,
    };

    const response = NextResponse.json({ success: true, user: cookieData });

    response.cookies.set("camatch_user", encodeUserCookie(cookieData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err) {
    console.error("Dev login error:", err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

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

    let cookieData: {
      id: string;
      phone: string;
      role: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };

    try {
      const user = await prisma.user.upsert({
        where: { phone },
        update: {
          role: isPro ? "PROFESSIONAL" : "CLIENT",
          status: "ACTIVE",
        },
        create: {
          phone,
          role: isPro ? "PROFESSIONAL" : "CLIENT",
          status: "ACTIVE",
          profile: {
            create: {
              firstName: isPro ? "Kouamé" : "Ahou",
              lastName: isPro ? "Jean" : "Mireille",
              zone: ["Cocody", "Riviera", "Plateau"],
              trustScore: 999,
              badge: "ELITE",
              isVerified: true,
              isOnsiteVerified: true,
              onboardingCompleted: true,
              isAvailable: true,
              experience: 15,
              missionCount: 247,
              responseTime: 3,
              acceptanceRate: 99,
              profession: isPro ? "Super Professionnel" : null,
              bio: isPro
                ? "Professionnel certifié avec plus de 15 ans d'expérience."
                : null,
            },
          },
        },
        include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      });

      cookieData = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        avatarUrl: user.profile?.avatarUrl || null,
      };
    } catch (dbError) {
      // DB not available — use hardcoded fallback so login always works
      console.warn("DB unavailable for dev-login, using fallback:", dbError);
      cookieData = {
        id: `dev-${isPro ? "pro" : "client"}-001`,
        phone,
        role: isPro ? "PROFESSIONAL" : "CLIENT",
        firstName: isPro ? "Kouamé" : "Ahou",
        lastName: isPro ? "Jean" : "Mireille",
        avatarUrl: null,
      };
    }

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
    // Last-resort fallback
    const fallback = {
      id: "dev-fallback-001",
      phone: "+2250000000001",
      role: "CLIENT" as const,
      firstName: "Ahou",
      lastName: "Mireille",
      avatarUrl: null,
    };
    const response = NextResponse.json({ success: true, user: fallback });
    response.cookies.set("camatch_user", encodeUserCookie(fallback), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import prisma from "@/lib/prisma";

const ADMIN_PHONE = "+225564148172";
const ADMIN_EMAIL = "admin@camatch.ci";
const ADMIN_PASSWORD = "Admin123!";

export async function POST(request: NextRequest) {
  try {
    const { phone, role } = await request.json();
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned !== "0564148172") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    let userData = signInData;

    if (signInError) {
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                response.cookies.set(name, value, options);
              });
            },
          },
        },
      );

      const { error: createError } = await adminSupabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        phone: ADMIN_PHONE,
        phone_confirm: true,
        user_metadata: { role: "admin" },
      });

      if (createError && !createError.message?.includes("already")) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

      if (retryError || !retryData?.session) {
        return NextResponse.json({ error: retryError?.message || "Échec de connexion" }, { status: 500 });
      }

      userData = retryData;
    }

    if (!userData?.session || !userData?.user) {
      return NextResponse.json({ error: "Session non créée" }, { status: 500 });
    }

    const userId = userData.user.id;
    const dbRole = role === "pro" ? "PROFESSIONAL" : "CLIENT" as const;

    await prisma.user.upsert({
      where: { id: userId },
      update: { role: dbRole, status: "ACTIVE" },
      create: {
        id: userId,
        phone: ADMIN_PHONE,
        role: dbRole,
        status: "ACTIVE",
        profile: {
          create: {
            firstName: "Admin",
            lastName: "Ça Match",
            zone: ["Cocody"],
            trustScore: 100,
            badge: "ELITE",
            isVerified: true,
            onboardingCompleted: true,
            isAvailable: true,
            profession: dbRole === "PROFESSIONAL" ? "Super Pro" : null,
          },
        },
      },
    });

    return response;
  } catch (err) {
    console.error("Admin bypass error:", err);
    return NextResponse.json({ error: "Erreur de connexion admin" }, { status: 500 });
  }
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  interface DevUser { id: string; phone: string; role: string; firstName: string; lastName: string; }

  let hasUser = !!user;
  if (!hasUser) {
    const devCookie = request.cookies.get("camatch_user")?.value;
    if (devCookie) {
      try {
        const raw = Buffer.from(devCookie, "base64").toString("utf-8");
        const devUser = JSON.parse(raw) as DevUser;
        if (devUser.id) hasUser = true;
      } catch { /* ignore invalid cookie */ }
    }
  }

  const protectedPaths = ["/dashboard", "/messages", "/demandes", "/opportunites", "/profile"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/dev-login");

  if (!hasUser && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasUser && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const protectedPaths = ["/dashboard", "/messages", "/demandes", "/opportunites", "/profile", "/onboarding"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  const devCookie = request.cookies.get("camatch_user")?.value;
  let hasUser = false;

  if (devCookie) {
    try {
      const raw = Buffer.from(devCookie, "base64").toString("utf-8");
      const devUser = JSON.parse(raw);
      if (devUser.id) hasUser = true;
    } catch { /* ignore invalid */ }
  }

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

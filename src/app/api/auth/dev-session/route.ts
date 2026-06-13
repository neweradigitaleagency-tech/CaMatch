import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("camatch_user")?.value;
  if (!cookie) return NextResponse.json({ user: null });

  try {
    const raw = Buffer.from(cookie, "base64").toString("utf-8");
    const user = JSON.parse(raw);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

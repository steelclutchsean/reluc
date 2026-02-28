import { NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/require-auth";
import { enforceRateLimit } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const rateLimited = enforceRateLimit(req, "verify-check", 40, 60_000);
    if (rateLimited) return rateLimited;

    const user = await getAuthorizedUser(req);
    if (!user) {
      return NextResponse.json({ authorized: false, authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authorized: true,
      authenticated: true,
      email: user.email,
    });
  } catch {
    return NextResponse.json({ authorized: false, authenticated: false }, { status: 401 });
  }
}

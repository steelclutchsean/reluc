import { NextResponse } from "next/server";
import { badRequest, forbidden, internalServerError } from "@/lib/errors";
import { signAccessToken } from "@/lib/auth";
import { getUserByEmail, hasActiveEntitlement } from "@/lib/subscriptions";
import { enforceOrigin, enforceRateLimit } from "@/lib/security";
import { clampString, isValidEmail } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const originError = enforceOrigin(req);
    if (originError) return originError;
    const rateLimited = enforceRateLimit(req, "verify-crypto", 12, 60_000);
    if (rateLimited) return rateLimited;

    const { email: rawEmail } = await req.json();
    const email = clampString(rawEmail, 320).toLowerCase();
    if (!isValidEmail(email)) return badRequest("Invalid email");

    const user = await getUserByEmail(email);
    if (!user) return forbidden("Payment not confirmed yet");

    const entitled = await hasActiveEntitlement(user.id, false);
    if (!entitled) return forbidden("Payment not confirmed yet");

    const token = await signAccessToken(
      {
        userId: user.id,
        email: user.email,
        paid: true,
        lifetime: false,
      },
      "30d",
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set("rs_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Crypto verify error:", err);
    return internalServerError();
  }
}

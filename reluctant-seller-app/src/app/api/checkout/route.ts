import { NextResponse } from "next/server";
import Stripe from "stripe";
import { badRequest, internalServerError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { enforceOrigin, enforceRateLimit, withTimeout } from "@/lib/security";
import { clampString, isValidEmail, isValidPlan } from "@/lib/validation";

function getStripe() {
  return new Stripe(getEnv("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" as any });
}

export async function POST(req: Request) {
  try {
    const originError = enforceOrigin(req);
    if (originError) return originError;
    const rateLimited = enforceRateLimit(req, "checkout", 8, 60_000);
    if (rateLimited) return rateLimited;

    const stripe = getStripe();
    const { email: rawEmail, plan } = await req.json();
    const email = clampString(rawEmail, 320).toLowerCase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!isValidPlan(plan)) {
      return badRequest("Invalid plan");
    }
    if (email && !isValidEmail(email)) {
      return badRequest("Invalid email");
    }

    const isLifetime = plan === "lifetime";
    const priceId = isLifetime ? getEnv("STRIPE_LIFETIME_PRICE_ID") : getEnv("STRIPE_PRICE_ID");

    const session = await withTimeout(
      () =>
        stripe.checkout.sessions.create({
          mode: isLifetime ? "payment" : "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          customer_email: email || undefined,
          success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/#pricing`,
          allow_promotion_codes: true,
          billing_address_collection: "auto",
          ...(isLifetime ? {} : { payment_method_collection: "always" as const }),
        }),
      10_000,
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return internalServerError();
  }
}

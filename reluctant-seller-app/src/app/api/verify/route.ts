import { NextResponse } from "next/server";
import Stripe from "stripe";
import { badRequest, forbidden, internalServerError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { signAccessToken } from "@/lib/auth";
import { setStripeSubscriptionState, upsertUserByEmail } from "@/lib/subscriptions";
import { enforceOrigin, enforceRateLimit, withTimeout } from "@/lib/security";
import { isValidStripeSessionId } from "@/lib/validation";

function getStripe() {
  return new Stripe(getEnv("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" as any });
}

export async function POST(req: Request) {
  try {
    const originError = enforceOrigin(req);
    if (originError) return originError;
    const rateLimited = enforceRateLimit(req, "verify", 12, 60_000);
    if (rateLimited) return rateLimited;

    const stripe = getStripe();
    const { sessionId } = await req.json();

    if (!sessionId || !isValidStripeSessionId(sessionId)) {
      return badRequest("Invalid session ID");
    }

    const session = await withTimeout(
      () =>
        stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["subscription", "customer"],
        }),
      12_000,
    );

    if (session.payment_status !== "paid" || !session.customer_email) {
      return forbidden("Payment not completed");
    }

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const email = session.customer_email.toLowerCase();
    const isLifetime = session.mode === "payment";
    const user = await upsertUserByEmail({ email, stripeCustomerId: customerId || null });

    if (isLifetime) {
      await setStripeSubscriptionState({
        userId: user.id,
        stripeSubscriptionId: `lifetime:${session.id}`,
        status: "paid",
        planType: "lifetime",
      });
    } else {
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (!subscriptionId) {
        return forbidden("Missing subscription");
      }
      const subscriptionObj =
        typeof session.subscription === "object" && session.subscription ? session.subscription : null;
      const periodEnd = subscriptionObj?.current_period_end
        ? new Date(subscriptionObj.current_period_end * 1000)
        : null;

      await setStripeSubscriptionState({
        userId: user.id,
        stripeSubscriptionId: subscriptionId,
        status: "active",
        planType: "monthly",
        currentPeriodEnd: periodEnd,
      });
    }

    const token = await signAccessToken(
      {
        userId: user.id,
        customerId: customerId || undefined,
        email,
        paid: true,
        lifetime: isLifetime,
      },
      isLifetime ? "3650d" : "30d",
    );

    const response = NextResponse.json({ success: true, email, lifetime: isLifetime });
    response.cookies.set("rs_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: isLifetime ? 10 * 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Verify error:", err);
    return internalServerError();
  }
}

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { badRequest, internalServerError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import {
  getUserByStripeCustomerId,
  markWebhookProcessed,
  setStripeSubscriptionState,
  updateStripeSubscriptionStatus,
  upsertUserByEmail,
} from "@/lib/subscriptions";

function getStripe() {
  return new Stripe(getEnv("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" as any });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return badRequest("Missing signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, getEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return badRequest("Invalid signature");
  }

  try {
    const shouldProcess = await markWebhookProcessed("stripe", event.id);
    if (!shouldProcess) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.customer_email) break;

        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const user = await upsertUserByEmail({
          email: session.customer_email,
          stripeCustomerId: customerId || null,
        });

        if (session.mode === "payment") {
          await setStripeSubscriptionState({
            userId: user.id,
            stripeSubscriptionId: `lifetime:${session.id}`,
            status: "paid",
            planType: "lifetime",
          });
        } else {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          if (subId) {
            await setStripeSubscriptionState({
              userId: user.id,
              stripeSubscriptionId: subId,
              status: "active",
              planType: "monthly",
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const user = await getUserByStripeCustomerId(customerId);
        if (!user) break;

        await updateStripeSubscriptionStatus({
          stripeSubscriptionId: sub.id,
          status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return internalServerError();
  }
}

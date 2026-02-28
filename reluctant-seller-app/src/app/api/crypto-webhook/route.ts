import crypto from "crypto";
import { NextResponse } from "next/server";
import { badRequest, internalServerError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { markWebhookProcessed, setCoinbaseSubscriptionState, upsertUserByEmail } from "@/lib/subscriptions";

function verifyCoinbaseSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", getEnv("COINBASE_WEBHOOK_SHARED_SECRET"))
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-cc-webhook-signature");
  if (!signature) return badRequest("Missing signature");

  const body = await req.text();
  if (!verifyCoinbaseSignature(body, signature)) {
    return badRequest("Invalid signature");
  }

  try {
    const payload = JSON.parse(body);
    const eventId = payload?.id;
    if (!eventId) return badRequest("Missing event id");

    const shouldProcess = await markWebhookProcessed("coinbase", eventId);
    if (!shouldProcess) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const eventType = payload?.event?.type as string | undefined;
    const metadata = payload?.event?.data?.metadata || {};
    const email = typeof metadata.email === "string" ? metadata.email : "";
    const plan = metadata.plan === "lifetime" ? "lifetime" : "monthly";

    if (eventType === "charge:confirmed" && email) {
      const user = await upsertUserByEmail({ email });
      await setCoinbaseSubscriptionState({
        userId: user.id,
        status: "paid",
        planType: plan,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Coinbase webhook processing error:", err);
    return internalServerError();
  }
}

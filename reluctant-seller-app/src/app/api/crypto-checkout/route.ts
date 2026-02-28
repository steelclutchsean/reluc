import { NextResponse } from "next/server";
import { badRequest, internalServerError } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { enforceOrigin, enforceRateLimit, withTimeout } from "@/lib/security";
import { clampString, isValidEmail, isValidPlan } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const originError = enforceOrigin(req);
    if (originError) return originError;
    const rateLimited = enforceRateLimit(req, "crypto-checkout", 6, 60_000);
    if (rateLimited) return rateLimited;

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
    const amount = isLifetime ? "88.00" : "13.00";
    const label = isLifetime ? "Lifetime Access" : "Monthly Access";

    const response = await withTimeout(
      (signal) =>
        fetch("https://api.commerce.coinbase.com/charges", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CC-Api-Key": getEnv("COINBASE_COMMERCE_API_KEY"),
            "X-CC-Version": "2018-03-22",
          },
          body: JSON.stringify({
            name: `The Reluctant Seller - ${label}`,
            description: isLifetime
              ? "Full playbook + Reluctant Email Generator. One-time payment, lifetime access."
              : "Full playbook + Reluctant Email Generator. $13/month.",
            pricing_type: "fixed_price",
            local_price: { amount, currency: "USD" },
            metadata: { email: email || "", plan },
            redirect_url: `${appUrl}/success?crypto=true&email=${encodeURIComponent(email)}`,
            cancel_url: `${appUrl}/#pricing`,
          }),
          signal,
        }),
      12_000,
    );

    if (!response.ok) {
      return internalServerError();
    }

    const data = await response.json();
    if (data.data?.hosted_url) {
      return NextResponse.json({ url: data.data.hosted_url });
    }

    return internalServerError();
  } catch (err) {
    console.error("Crypto checkout error:", err);
    return internalServerError();
  }
}

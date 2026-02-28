import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { badRequest, internalServerError, unauthorized } from "@/lib/errors";
import { getEnv } from "@/lib/env";
import { getAuthorizedUser } from "@/lib/require-auth";
import { enforceOrigin, enforceRateLimit, withTimeout } from "@/lib/security";
import { clampString } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const originError = enforceOrigin(req);
    if (originError) return originError;
    const rateLimited = enforceRateLimit(req, "generate", 25, 60_000);
    if (rateLimited) return rateLimited;

    const user = await getAuthorizedUser(req);
    if (!user) {
      return unauthorized();
    }

    const { email: rawEmail, context: rawContext } = await req.json();
    const email = clampString(rawEmail, 15_000);
    const context = clampString(rawContext, 3_000);

    if (!email || email.length < 10) {
      return badRequest("Please provide an email to rewrite");
    }

    const anthropic = new Anthropic({ apiKey: getEnv("ANTHROPIC_API_KEY") });

    const systemPrompt = `You are The Reluctant Seller - an expert at transforming eager, pushy, or generic sales emails into three distinct versions that embody the "reluctant seller" philosophy. The reluctant seller never chases, never seems desperate, and makes the recipient feel like THEY are the ones pursuing.

Core principles:
- The email should feel like a gift, not an invoice
- Never pitch directly — share insight, create curiosity
- Position as a peer, not a vendor
- Make it easy to say no (which paradoxically makes them say yes)
- Shorter is better. White space is your friend.
- The sender should sound like they're genuinely unsure if this is the right fit

You must return exactly 3 versions in this JSON format:
{
  "versions": [
    {
      "label": "The Curious Peer",
      "tone": "brief description of tone",
      "subject": "email subject line",
      "body": "the email body"
    },
    {
      "label": "The Reluctant Expert",
      "tone": "brief description of tone",
      "subject": "email subject line",
      "body": "the email body"
    },
    {
      "label": "The Generous Observer",
      "tone": "brief description of tone",
      "subject": "email subject line",
      "body": "the email body"
    }
  ]
}

Return ONLY valid JSON. No markdown, no code blocks, just JSON.`;

    let userPrompt = `Rewrite the following email into 3 reluctant seller versions:\n\n---\n${email}\n---`;

    if (context && context.trim().length > 0) {
      userPrompt += `\n\nAdditional context about the recipient/situation:\n${context}`;
    }

    const message = await withTimeout(
      (signal) =>
        anthropic.messages.create(
          {
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            stream: false,
            messages: [{ role: "user", content: userPrompt }],
            system: systemPrompt,
          },
          { signal },
        ),
      30_000,
    );

    if (!("content" in message)) {
      throw new Error("Unexpected model response");
    }
    const responseText = message.content[0]?.type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Generate error:", err);
    return internalServerError();
  }
}

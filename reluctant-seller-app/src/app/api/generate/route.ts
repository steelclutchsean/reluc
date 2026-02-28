import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import Anthropic from '@anthropic-ai/sdk';

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me-in-production');
}

export async function POST(req: Request) {
  try {
    // Verify auth
    const secret = getSecret();
    const cookie = req.headers.get('cookie') || '';
    const tokenMatch = cookie.match(/rs_token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await jwtVerify(tokenMatch[1], secret);

    const { email, context } = await req.json();

    if (!email || email.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide an email to rewrite' }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const systemPrompt = `You are The Reluctant Seller — an expert at transforming eager, pushy, or generic sales emails into three distinct versions that embody the "reluctant seller" philosophy. The reluctant seller never chases, never seems desperate, and makes the recipient feel like THEY are the ones pursuing.

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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

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
        throw new Error('Failed to parse AI response');
      }
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

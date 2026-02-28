import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any });
}
function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me-in-production');
}

export async function GET(req: Request) {
  try {
    const stripe = getStripe();
    const secret = getSecret();
    const cookie = req.headers.get('cookie') || '';
    const tokenMatch = cookie.match(/rs_token=([^;]+)/);

    if (!tokenMatch) {
      return NextResponse.json({ authorized: false, authenticated: false }, { status: 401 });
    }

    const { payload } = await jwtVerify(tokenMatch[1], secret);

    // Lifetime customers skip subscription check
    if (payload.lifetime) {
      // Lifetime access — always authorized
    } else if (payload.customerId) {
      // Monthly subscribers — verify subscription is still active
      const subscriptions = await stripe.subscriptions.list({
        customer: payload.customerId as string,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return NextResponse.json({ authorized: false, authenticated: false, reason: 'subscription_inactive' }, { status: 403 });
      }
    }

    return NextResponse.json({
      authorized: true,
      authenticated: true,
      email: payload.email,
    });
  } catch (err: any) {
    return NextResponse.json({ authorized: false, authenticated: false }, { status: 401 });
  }
}

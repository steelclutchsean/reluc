import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SignJWT } from 'jose';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any });
}
function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me-in-production');
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const secret = getSecret();
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 });
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const email = session.customer_email || '';
    const isLifetime = session.mode === 'payment'; // one-time payment = lifetime

    // Create a JWT token for dashboard access
    const token = await new SignJWT({
      customerId,
      email,
      paid: true,
      lifetime: isLifetime,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(isLifetime ? '3650d' : '30d') // ~10 years for lifetime
      .sign(secret);

    const response = NextResponse.json({ success: true, email });

    // Set auth cookie
    response.cookies.set('rs_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: isLifetime ? 10 * 365 * 24 * 60 * 60 : 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

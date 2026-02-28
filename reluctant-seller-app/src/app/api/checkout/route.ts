import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any });
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const { email, plan } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const isLifetime = plan === 'lifetime';
    const priceId = isLifetime
      ? process.env.STRIPE_LIFETIME_PRICE_ID!
      : process.env.STRIPE_PRICE_ID!;

    const session = await stripe.checkout.sessions.create({
      mode: isLifetime ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      ...(isLifetime ? {} : { payment_method_collection: 'always' as const }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

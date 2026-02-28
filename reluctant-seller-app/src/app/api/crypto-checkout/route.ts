import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, plan } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const isLifetime = plan === 'lifetime';
    const amount = isLifetime ? '88.00' : '13.00';
    const label = isLifetime ? 'Lifetime Access' : 'Monthly Access';

    // Create a Coinbase Commerce charge
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: `The Reluctant Seller — ${label}`,
        description: isLifetime
          ? 'Full playbook + Reluctant Email Generator. One-time payment, lifetime access.'
          : 'Full playbook + Reluctant Email Generator. $13/month.',
        pricing_type: 'fixed_price',
        local_price: { amount, currency: 'USD' },
        metadata: { email: email || '', plan: plan || 'monthly' },
        redirect_url: `${appUrl}/success?crypto=true`,
        cancel_url: `${appUrl}/#pricing`,
      }),
    });

    const data = await response.json();

    if (data.data?.hosted_url) {
      return NextResponse.json({ url: data.data.hosted_url });
    }

    return NextResponse.json({ error: 'Failed to create crypto charge' }, { status: 500 });
  } catch (err: any) {
    console.error('Crypto checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

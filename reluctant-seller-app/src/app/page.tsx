"use client";
import { useState } from "react";
import Logo from "./logo";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState("");

  const [plan, setPlan] = useState<"monthly" | "lifetime">("lifetime");

  async function handleCheckout(method: string) {
    setLoading(method);
    // Fire Meta Pixel InitiateCheckout event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        value: plan === "lifetime" ? 88.0 : 13.0,
        currency: "USD",
        content_name: `The Reluctant Seller - ${plan}`,
      });
    }
    try {
      const endpoint = method === "crypto" ? "/api/crypto-checkout" : "/api/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Something went wrong");
    } catch (err) {
      alert("Payment error. Please try again.");
    }
    setLoading("");
  }

  return (
    <main className="max-w-[720px] mx-auto px-5 pb-20">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[54px] flex items-center justify-center px-4 bg-[rgba(242,242,247,0.72)] backdrop-blur-[40px] saturate-[180%] border-b border-[rgba(60,60,67,0.12)]">
        <span className="text-[17px] font-semibold tracking-tight">The Reluctant Seller</span>
      </nav>

      {/* HERO */}
      <section className="text-center pt-28 pb-8 animate-fade-in">
        <div className="mx-auto mb-6 w-[100px] h-[100px] rounded-[26px] glass-card relative flex items-center justify-center overflow-hidden shadow-lg">
          <Logo size={90} />
        </div>
        <h1 className="text-[clamp(30px,7vw,42px)] font-bold tracking-tight leading-[1.1] mb-3">
          Stop Selling.<br />
          <span className="bg-gradient-to-r from-[#B8963E] to-[#D4A84B] bg-clip-text text-transparent">
            Start Letting People Buy.
          </span>
        </h1>
        <p className="text-[17px] text-[rgba(60,60,67,0.6)] max-w-[460px] mx-auto leading-relaxed mb-8">
          The complete system for founders and CEOs who close more by pushing less.
          Simulator + Playbook + AI Email Generator.
        </p>
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <a href="#pricing" className="btn-pill bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)] spring-hover">
            Get Access <span className="text-lg">→</span>
          </a>
          <a href="/simulator.html" target="_blank" className="btn-pill bg-white/50 backdrop-blur-xl border border-white/40 text-black shadow-sm spring-hover">
            Try Free Simulator
          </a>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="animate-fade-in-delay">
        <div className="glass-card relative rounded-[28px] p-8 mb-6 overflow-hidden">
          <h2 className="text-[13px] font-semibold tracking-wider uppercase text-[rgba(60,60,67,0.6)] mb-6">What You Get</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-[14px] bg-[rgba(0,122,255,0.1)] border border-[rgba(0,122,255,0.15)] flex items-center justify-center text-xl flex-shrink-0">📱</div>
              <div>
                <h3 className="font-bold text-[17px] tracking-tight mb-1">Interactive Simulator</h3>
                <p className="text-[15px] text-[rgba(60,60,67,0.6)] leading-relaxed">5 real-world scenarios, 3 choices each, two-phase branching. Decision DNA analysis, vulnerability detection, and a personalized reading path. Free forever.</p>
              </div>
            </div>

            <div className="h-[0.5px] bg-[rgba(60,60,67,0.12)]" />

            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-[14px] bg-[rgba(184,150,62,0.1)] border border-[rgba(184,150,62,0.15)] flex items-center justify-center text-xl flex-shrink-0">📖</div>
              <div>
                <h3 className="font-bold text-[17px] tracking-tight mb-1">The Full Playbook <span className="text-[12px] font-semibold text-[#B8963E] bg-[rgba(184,150,62,0.1)] px-2 py-0.5 rounded-full border border-[rgba(184,150,62,0.15)] ml-1">PAID</span></h3>
                <p className="text-[15px] text-[rgba(60,60,67,0.6)] leading-relaxed">20-page guide covering discovery, outreach, negotiation, running a sales org, and selling your company. The lemonade stand metaphor that reframes everything.</p>
              </div>
            </div>

            <div className="h-[0.5px] bg-[rgba(60,60,67,0.12)]" />

            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-[14px] bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] flex items-center justify-center text-xl flex-shrink-0">✉️</div>
              <div>
                <h3 className="font-bold text-[17px] tracking-tight mb-1">Reluctant Email Generator <span className="text-[12px] font-semibold text-[#B8963E] bg-[rgba(184,150,62,0.1)] px-2 py-0.5 rounded-full border border-[rgba(184,150,62,0.15)] ml-1">PAID</span></h3>
                <p className="text-[15px] text-[rgba(60,60,67,0.6)] leading-relaxed">Paste any sales email — get 3 unique reluctant rewrites powered by AI. Add context about the recipient, product, or company for hyper-personalized versions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="animate-fade-in-delay-2">
        <div className="glass-dark relative rounded-[28px] p-8 text-center mb-8 overflow-hidden">
          <div className="relative">
            <div className="mb-3"><Logo size={44} /></div>
            <blockquote className="text-[16px] leading-relaxed text-white/80 italic max-w-[460px] mx-auto">
              &ldquo;The other kids were selling lemonade. I was letting people buy it. There is a canyon of difference between those two things.&rdquo;
            </blockquote>
            <cite className="block text-[#B8963E] text-[12px] font-semibold tracking-widest uppercase mt-3 not-italic">The Reluctant Seller</cite>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-20">
        {/* Plan toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full bg-white/50 backdrop-blur-xl border border-white/40 p-1">
            <button
              onClick={() => setPlan("monthly")}
              className={`px-6 py-2.5 rounded-full text-[15px] font-semibold transition-all ${
                plan === "monthly"
                  ? "bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
                  : "text-[rgba(60,60,67,0.5)]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPlan("lifetime")}
              className={`px-6 py-2.5 rounded-full text-[15px] font-semibold transition-all ${
                plan === "lifetime"
                  ? "bg-[#B8963E] text-white shadow-[0_4px_16px_rgba(184,150,62,0.3)]"
                  : "text-[rgba(60,60,67,0.5)]"
              }`}
            >
              Lifetime ⭐
            </button>
          </div>
        </div>

        <div className="glass-card relative rounded-[28px] overflow-hidden">
          <div className="p-8 text-center border-b border-[rgba(60,60,67,0.08)]">
            {plan === "monthly" ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] text-[#34C759] text-[12px] font-bold tracking-wider uppercase mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_6px_rgba(52,199,89,0.4)]" />
                  Monthly Access
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-[48px] font-bold tracking-tight leading-none">$13</span>
                  <span className="text-[17px] text-[rgba(60,60,67,0.5)] font-medium">/month</span>
                </div>
                <p className="text-[15px] text-[rgba(60,60,67,0.5)] max-w-[360px] mx-auto">
                  Full playbook + unlimited AI email rewrites. Cancel anytime.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(184,150,62,0.1)] border border-[rgba(184,150,62,0.15)] text-[#B8963E] text-[12px] font-bold tracking-wider uppercase mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#B8963E] shadow-[0_0_6px_rgba(184,150,62,0.4)]" />
                  Lifetime Access
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-[48px] font-bold tracking-tight leading-none">$88</span>
                  <span className="text-[17px] text-[rgba(60,60,67,0.5)] font-medium">one-time</span>
                </div>
                <p className="text-[15px] text-[rgba(60,60,67,0.5)] max-w-[360px] mx-auto">
                  Pay once, own forever. Full playbook + unlimited AI email rewrites. No recurring charges.
                </p>
                <div className="inline-flex items-center gap-1 mt-3 text-[13px] text-[#34C759] font-semibold">
                  <span>Save $68 vs. first year of monthly</span>
                </div>
              </>
            )}
          </div>

          <div className="p-8">
            {/* Email input */}
            <div className="max-w-[400px] mx-auto mb-6">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-5 py-3.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 text-[15px] outline-none focus:border-[#007AFF] focus:shadow-[0_0_0_3px_rgba(0,122,255,0.12)] transition-all placeholder:text-[rgba(60,60,67,0.3)]"
              />
            </div>

            {/* Payment buttons */}
            <div className="space-y-3 max-w-[400px] mx-auto">
              {/* Credit Card / PayPal / Venmo via Stripe */}
              <button
                onClick={() => handleCheckout("stripe")}
                disabled={!!loading}
                className={`w-full btn-pill justify-center text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)] spring-hover disabled:opacity-60 ${
                  plan === "lifetime" ? "bg-[#B8963E] shadow-[0_4px_16px_rgba(184,150,62,0.3)]" : "bg-[#007AFF]"
                }`}
              >
                {loading === "stripe" ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>💳 {plan === "lifetime" ? "Get Lifetime Access" : "Subscribe"} — Card / PayPal / Venmo</>
                )}
              </button>

              {/* Crypto via Coinbase */}
              <button
                onClick={() => handleCheckout("crypto")}
                disabled={!!loading}
                className="w-full btn-pill justify-center bg-[#F7931A]/10 text-[#F7931A] border border-[#F7931A]/20 spring-hover disabled:opacity-60"
              >
                {loading === "crypto" ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>₿ Pay with Bitcoin / Crypto</>
                )}
              </button>
            </div>

            {/* Payment method logos */}
            <div className="flex items-center justify-center gap-4 mt-6 text-[12px] text-[rgba(60,60,67,0.3)] font-medium">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>Amex</span>
              <span>PayPal</span>
              <span>Venmo</span>
              <span>BTC</span>
            </div>

            <p className="text-center text-[12px] text-[rgba(60,60,67,0.3)] mt-4">
              Secure payment via Stripe & Coinbase Commerce.{plan === "monthly" && " Cancel anytime from your dashboard."}
            </p>
          </div>
        </div>
      </section>

      {/* Already a member */}
      <div className="text-center mt-6 mb-12">
        <a href="/dashboard" className="text-[15px] text-[rgba(60,60,67,0.5)] hover:text-[#007AFF] transition-colors">
          Already a member? Access your dashboard →
        </a>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-[13px] text-[rgba(60,60,67,0.3)] pt-8 border-t border-[rgba(60,60,67,0.08)]">
        <div className="flex items-center justify-center gap-1 mb-2">
          <Logo size={20} />
          <span className="font-semibold">The Reluctant Seller</span>
        </div>
        <p>Built for founders and CEOs who close more by pushing less.</p>
      </footer>
    </main>
  );
}

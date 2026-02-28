"use client";
import { useState, useEffect } from "react";
import Logo from "../logo";

interface EmailVersion {
  label: string;
  tone: string;
  subject: string;
  body: string;
}

export default function Dashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [context, setContext] = useState("");
  const [versions, setVersions] = useState<EmailVersion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"playbook" | "emails">("emails");

  useEffect(() => {
    fetch("/api/verify/check")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authorized))
      .catch(() => setAuthed(false));
  }, []);

  async function handleGenerate() {
    if (!email.trim()) return;
    setGenerating(true);
    setVersions([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), context: context.trim() }),
      });
      const data = await res.json();
      if (data.versions) setVersions(data.versions);
      else alert(data.error || "Generation failed. Please try again.");
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setGenerating(false);
  }

  function copyToClipboard(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  // Loading state
  if (authed === null) {
    return (
      <main className="max-w-[720px] mx-auto px-5 pt-28 text-center">
        <div className="animate-pulse text-[17px] text-[rgba(60,60,67,0.5)]">
          Checking access...
        </div>
      </main>
    );
  }

  // Not authorized
  if (!authed) {
    return (
      <main className="max-w-[720px] mx-auto px-5 pt-28 text-center">
        <div className="glass-card rounded-[28px] p-8">
          <div className="mb-4"><Logo size={60} /></div>
          <h1 className="text-[24px] font-bold tracking-tight mb-3">Access Required</h1>
          <p className="text-[15px] text-[rgba(60,60,67,0.6)] mb-6">
            You need an active subscription to access the dashboard. Subscribe to get the full playbook and the Reluctant Email Generator.
          </p>
          <a
            href="/#pricing"
            className="btn-pill bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)] spring-hover inline-flex"
          >
            Get Access <span className="text-lg">→</span>
          </a>
        </div>
      </main>
    );
  }

  // Authorized — show dashboard
  return (
    <main className="max-w-[720px] mx-auto px-5 pb-20">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[54px] flex items-center justify-between px-5 bg-[rgba(242,242,247,0.72)] backdrop-blur-[40px] saturate-[180%] border-b border-[rgba(60,60,67,0.12)]">
        <a href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-[15px] font-semibold tracking-tight">The Reluctant Seller</span>
        </a>
        <span className="text-[12px] font-semibold text-[#34C759] bg-[rgba(52,199,89,0.1)] px-3 py-1 rounded-full border border-[rgba(52,199,89,0.15)]">
          Active Member
        </span>
      </nav>

      {/* HEADER */}
      <section className="pt-24 pb-4 animate-fade-in">
        <h1 className="text-[28px] font-bold tracking-tight mb-1">Your Dashboard</h1>
        <p className="text-[15px] text-[rgba(60,60,67,0.5)]">
          Access your playbook and generate reluctant emails below.
        </p>
      </section>

      {/* TAB SWITCHER */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("emails")}
          className={`px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all ${
            activeTab === "emails"
              ? "bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
              : "bg-white/50 backdrop-blur-xl border border-white/40 text-[rgba(60,60,67,0.6)]"
          }`}
        >
          ✉️ Email Generator
        </button>
        <button
          onClick={() => setActiveTab("playbook")}
          className={`px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all ${
            activeTab === "playbook"
              ? "bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
              : "bg-white/50 backdrop-blur-xl border border-white/40 text-[rgba(60,60,67,0.6)]"
          }`}
        >
          📖 Playbook
        </button>
      </div>

      {/* EMAIL GENERATOR TAB */}
      {activeTab === "emails" && (
        <section className="animate-fade-in">
          <div className="glass-card rounded-[28px] p-8 mb-6">
            <h2 className="text-[13px] font-semibold tracking-wider uppercase text-[rgba(60,60,67,0.6)] mb-1">
              Reluctant Email Generator
            </h2>
            <p className="text-[15px] text-[rgba(60,60,67,0.5)] mb-6">
              Paste any sales email and get 3 unique &ldquo;reluctant&rdquo; rewrites. Add context about the recipient, product, or company for hyper-personalized versions.
            </p>

            {/* Email input */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[rgba(60,60,67,0.6)] mb-2">
                Paste Your Sales Email
              </label>
              <textarea
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Paste the email you want to transform into a reluctant version..."
                rows={6}
                className="w-full px-5 py-4 rounded-[20px] bg-white/60 backdrop-blur-xl border border-white/40 text-[15px] leading-relaxed outline-none focus:border-[#007AFF] focus:shadow-[0_0_0_3px_rgba(0,122,255,0.12)] transition-all placeholder:text-[rgba(60,60,67,0.3)] resize-none"
              />
            </div>

            {/* Context input */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-[rgba(60,60,67,0.6)] mb-2">
                Additional Context <span className="font-normal text-[rgba(60,60,67,0.3)]">(optional)</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Tell us about the recipient, your product, company, relationship, or anything that helps personalize the rewrite..."
                rows={3}
                className="w-full px-5 py-4 rounded-[20px] bg-white/60 backdrop-blur-xl border border-white/40 text-[15px] leading-relaxed outline-none focus:border-[#007AFF] focus:shadow-[0_0_0_3px_rgba(0,122,255,0.12)] transition-all placeholder:text-[rgba(60,60,67,0.3)] resize-none"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !email.trim()}
              className="w-full btn-pill justify-center bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)] spring-hover disabled:opacity-60"
            >
              {generating ? (
                <span className="animate-pulse">Generating 3 reluctant versions...</span>
              ) : (
                <>Generate Reluctant Emails ✨</>
              )}
            </button>
          </div>

          {/* RESULTS */}
          {versions.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-[13px] font-semibold tracking-wider uppercase text-[rgba(60,60,67,0.6)]">
                Your 3 Reluctant Versions
              </h3>
              {versions.map((v, i) => (
                <div key={i} className="glass-card rounded-[28px] p-6 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[12px] font-bold tracking-wider uppercase text-[#B8963E] bg-[rgba(184,150,62,0.1)] px-2.5 py-1 rounded-full border border-[rgba(184,150,62,0.15)]">
                        Version {i + 1}
                      </span>
                      <h4 className="text-[17px] font-bold tracking-tight mt-2">{v.label}</h4>
                      <p className="text-[13px] text-[rgba(60,60,67,0.5)] italic">{v.tone}</p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(`Subject: ${v.subject}\n\n${v.body}`, i)
                      }
                      className="px-4 py-2 rounded-full text-[13px] font-semibold bg-white/50 backdrop-blur-xl border border-white/40 text-[rgba(60,60,67,0.6)] spring-hover flex-shrink-0"
                    >
                      {copied === i ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="bg-white/40 rounded-[16px] p-5 border border-white/30">
                    <div className="text-[13px] font-semibold text-[rgba(60,60,67,0.5)] mb-1">Subject:</div>
                    <div className="text-[15px] font-semibold mb-4">{v.subject}</div>
                    <div className="h-[0.5px] bg-[rgba(60,60,67,0.1)] mb-4" />
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{v.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PLAYBOOK TAB */}
      {activeTab === "playbook" && (
        <section className="animate-fade-in">
          <div className="glass-card rounded-[28px] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-[18px] bg-[rgba(184,150,62,0.1)] border border-[rgba(184,150,62,0.15)] flex items-center justify-center text-3xl flex-shrink-0">
                📖
              </div>
              <div>
                <h2 className="text-[20px] font-bold tracking-tight">The Reluctant Seller Playbook</h2>
                <p className="text-[15px] text-[rgba(60,60,67,0.5)]">20-page guide — PDF format</p>
              </div>
            </div>

            <p className="text-[15px] text-[rgba(60,60,67,0.6)] leading-relaxed mb-6">
              The complete system for founders and CEOs who close more by pushing less. Covers discovery, outreach, negotiation, running a sales org, and selling your company — all through the &ldquo;reluctant&rdquo; lens.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] flex items-center justify-center text-[12px]">✓</span>
                <span className="text-[15px]">The Lemonade Stand Metaphor</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] flex items-center justify-center text-[12px]">✓</span>
                <span className="text-[15px]">Discovery &amp; Outreach Frameworks</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] flex items-center justify-center text-[12px]">✓</span>
                <span className="text-[15px]">Negotiation &amp; Closing Techniques</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] flex items-center justify-center text-[12px]">✓</span>
                <span className="text-[15px]">Running a Sales Org the Reluctant Way</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] flex items-center justify-center text-[12px]">✓</span>
                <span className="text-[15px]">Selling Your Company</span>
              </div>
            </div>

            <a
              href="/The_Reluctant_Seller.pdf"
              download
              className="w-full btn-pill justify-center bg-[#B8963E] text-white shadow-[0_4px_16px_rgba(184,150,62,0.3)] spring-hover inline-flex"
            >
              📥 Download Playbook (PDF)
            </a>
          </div>

          {/* Simulator link */}
          <div className="glass-card rounded-[28px] p-6 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold tracking-tight">Interactive Simulator</h3>
                <p className="text-[13px] text-[rgba(60,60,67,0.5)]">5 scenarios, 3 choices each — always free</p>
              </div>
              <a
                href="/simulator.html"
                target="_blank"
                className="px-5 py-2.5 rounded-full text-[15px] font-semibold bg-white/50 backdrop-blur-xl border border-white/40 text-[#007AFF] spring-hover flex-shrink-0"
              >
                Open →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="text-center text-[13px] text-[rgba(60,60,67,0.3)] pt-12 mt-12 border-t border-[rgba(60,60,67,0.08)]">
        <div className="flex items-center justify-center gap-1 mb-2">
          <Logo size={20} />
          <span className="font-semibold">The Reluctant Seller</span>
        </div>
        <p>
          Need to manage your subscription?{" "}
          <a href="https://billing.stripe.com/p/login/test" className="text-[#007AFF] hover:underline">
            Billing Portal
          </a>
        </p>
      </footer>
    </main>
  );
}

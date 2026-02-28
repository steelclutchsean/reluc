"use client";
import { useEffect, useState } from "react";
import Logo from "../logo";

export default function Success() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          // Fire Meta Pixel Purchase event
          if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq("track", "Purchase", {
              value: data.lifetime ? 88.0 : 13.0,
              currency: "USD",
            });
          }
          // Redirect to dashboard after a brief moment
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2500);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="max-w-[720px] mx-auto px-5 pt-28 text-center">
      {status === "verifying" && (
        <div className="glass-card rounded-[28px] p-10 animate-fade-in">
          <div className="mb-6"><Logo size={70} /></div>
          <div className="animate-pulse">
            <h1 className="text-[24px] font-bold tracking-tight mb-3">Verifying Your Payment...</h1>
            <p className="text-[15px] text-[rgba(60,60,67,0.5)]">
              Please wait while we confirm your subscription.
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="glass-card rounded-[28px] p-10 animate-fade-in">
          <div className="mb-4"><Logo size={70} /></div>
          <div className="w-16 h-16 rounded-full bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.15)] flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-[28px] font-bold tracking-tight mb-3">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#B8963E] to-[#D4A84B] bg-clip-text text-transparent">
              The Reluctant Seller
            </span>
          </h1>
          <p className="text-[15px] text-[rgba(60,60,67,0.5)] mb-6">
            Your subscription is active. Redirecting you to your dashboard...
          </p>
          <a
            href="/dashboard"
            className="btn-pill bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)] spring-hover inline-flex"
          >
            Go to Dashboard Now →
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="glass-card rounded-[28px] p-10 animate-fade-in">
          <div className="mb-4"><Logo size={70} /></div>
          <h1 className="text-[24px] font-bold tracking-tight mb-3">Something Went Wrong</h1>
          <p className="text-[15px] text-[rgba(60,60,67,0.5)] mb-6">
            We couldn&apos;t verify your payment. If you were charged, don&apos;t worry — your subscription is safe. Please try accessing the dashboard directly.
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="/dashboard"
              className="btn-pill bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.3)] spring-hover inline-flex"
            >
              Try Dashboard →
            </a>
            <a
              href="/"
              className="btn-pill bg-white/50 backdrop-blur-xl border border-white/40 text-black spring-hover inline-flex"
            >
              Back Home
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

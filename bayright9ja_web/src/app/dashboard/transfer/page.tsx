"use client";

import { useMemo } from "react";

function qrPatternFromSeed(seed: string) {
  return Array.from({ length: 49 }).map((_, index) => ((seed.charCodeAt(index % seed.length) + index) % 3 === 0));
}

export default function TransferPage() {
  const qrPattern = useMemo(() => qrPatternFromSeed("bayright9ja-request-money"), []);

  return (
    <section className="space-y-6 text-white">
      <div className="card-depth rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-neon-gold)]">
          Transfer
        </p>
        <h1 className="mt-3 text-3xl font-bold">Request money from your laptop</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
          Display this QR on your screen and let another Bayright9ja user scan it in the mobile app to pay instantly.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[2rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-neon-gold)]">
            Request Money QR
          </p>
          <div className="mx-auto mt-6 grid h-[18rem] w-[18rem] grid-cols-7 gap-2 rounded-[1.8rem] border border-[var(--color-neon-gold)]/45 bg-[#04182f] p-4 gold-pulse">
            {qrPattern.map((filled, index) => (
              <span
                key={index}
                className={`rounded-[0.35rem] ${filled ? "bg-[var(--color-neon-gold)]" : "bg-white/10"}`}
              />
            ))}
          </div>
          <p className="mt-6 text-center text-sm leading-7 text-white/68">
            Encodes a mock Bayright request reference for fast web-to-app payment.
          </p>
        </div>

        <div className="card-depth rounded-[2rem] p-6">
          <h2 className="text-2xl font-bold text-white">Request details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Recipient</p>
              <p className="mt-2 text-lg font-semibold text-white">Chukwudi Bayright</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Account Number</p>
              <p className="mt-2 text-lg font-semibold text-white">3021984421</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Suggested Amount</p>
              <p className="mt-2 text-lg font-semibold text-white">₦15,000.00</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Reference</p>
              <p className="mt-2 text-lg font-semibold text-white">BR9-WEB-REQ-9001</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

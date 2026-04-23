"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Cable, Search, ShieldCheck, SunMedium, Tv, Zap } from "lucide-react";
import { useMemo, useState } from "react";

const providers = [
  { name: "DStv Premium", category: "TV", icon: Tv },
  { name: "Showmax", category: "TV", icon: Tv },
  { name: "IKEDC", category: "Electricity", icon: Zap },
  { name: "Sun King", category: "Solar", icon: SunMedium },
  { name: "FiberOne", category: "Fiber", icon: Cable },
  { name: "AEDC", category: "Electricity", icon: Zap },
];

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const seededQuery = searchParams.get("query") ?? "";
  const [query, setQuery] = useState(seededQuery);

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) =>
        `${provider.name} ${provider.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <section className="space-y-6">
      <div className="card-depth rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-neon-gold)]">
          Biller Directory
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Find every Bayright9ja biller</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">
              Search by provider, category, or network and launch the right utility flow in one click.
            </p>
          </div>
          <div className="glass flex w-full max-w-xl items-center gap-3 rounded-full px-4 py-3">
            <Search className="h-5 w-5 text-[var(--color-neon-gold)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search DStv, Solar, IKEDC..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredProviders.map((provider) => {
          const Icon = provider.icon;
          const highlighted = query.length > 0 && provider.name.toLowerCase().includes(query.toLowerCase());

          return (
            <motion.article
              whileHover={{ y: -6, scale: 1.01 }}
              key={provider.name}
              className={`rounded-[1.7rem] border p-5 transition ${
                highlighted
                  ? "border-[var(--color-neon-gold)]/45 bg-[rgba(255,215,0,0.08)] shadow-[0_18px_40px_rgba(255,215,0,0.12)]"
                  : "border-white/10 bg-[#071a31]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-neon-gold)]/10 text-[var(--color-neon-gold)]">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-[var(--color-prosperity-green)]/30 bg-[var(--color-prosperity-green)]/12 px-3 py-1 text-xs font-bold text-[var(--color-prosperity-green)]">
                  Active
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">{provider.name}</h2>
              <p className="mt-2 text-sm text-white/58">{provider.category}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                  <ShieldCheck className="h-4 w-4 text-[var(--color-prosperity-green)]" />
                  Verified biller
                </div>
                <Link
                  href="/dashboard/payments"
                  className="rounded-full border border-[var(--color-neon-gold)]/28 bg-[var(--color-neon-gold)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-neon-gold)] transition hover:bg-[var(--color-neon-gold)] hover:text-[var(--color-deep-navy)]"
                >
                  Open
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

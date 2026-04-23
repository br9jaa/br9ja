"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function UserIdentityCard() {
  const { user } = useAuth();

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative aspect-[3/2] overflow-hidden rounded-[2rem] border border-[rgba(255,215,0,0.58)] bg-[linear-gradient(155deg,#06172b,#0b2340_52%,#08111f)] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.38)]"
    >
      <div className="mesh-watermark absolute inset-0 opacity-55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_55%)]" />
      <div className="absolute inset-3 rounded-[1.7rem] border border-[rgba(255,241,204,0.26)]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-neon-gold)]">
              BR9ja ID
            </p>
            <p className="mt-2 text-sm text-white/58">Digital Membership Card</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-prosperity-green)]/35 bg-[var(--color-prosperity-green)]/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-prosperity-green)] shadow-[0_0_28px_rgba(76,175,80,0.32)]">
            <ShieldCheck className="h-4 w-4" />
            Tier 2 Verified
          </div>
        </div>

        <div className="mt-6 flex flex-1 flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--color-neon-gold)] bg-[linear-gradient(145deg,#0d2b4c,#07192e)] text-3xl font-black text-white shadow-[0_0_24px_rgba(255,215,0,0.18)]">
              {(user?.name ?? "Bayright").charAt(0)}
            </div>
            <div>
              <h2 className="text-[1.55rem] font-black tracking-tight text-[var(--color-neon-gold)]">
                {user?.name ?? "Chukwudi Bayright"}
              </h2>
              <p className="mt-2 text-sm text-white/68">Bayright9ja premium vault member</p>
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/45">Account Number</p>
            <p className="mt-1 font-bold text-white">{user?.accountNumber ?? "3021984421"}</p>
          </div>
          <div className="text-right">
            <p className="text-white/45">KYC Status</p>
            <p className="mt-1 font-bold text-white">Tier {user?.kycTier ?? 2}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

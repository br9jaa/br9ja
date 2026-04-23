"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Tab = "qr" | "password";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("qr");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handlePasswordLogin = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await login({
      identity: identity || "member@bayright9ja.com",
      password,
    });
    router.push("/dashboard");
    onClose();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[var(--color-neon-gold)]/35 bg-[linear-gradient(180deg,rgba(12,28,49,0.95),rgba(2,13,28,0.98))] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/75 transition hover:border-[var(--color-neon-gold)]/35 hover:text-[var(--color-neon-gold)]"
          aria-label="Close login modal"
        >
          ✕
        </button>

        <div className="border-b border-white/8 px-6 pt-7">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-neon-gold)]">
            Secure Member Login
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeTab === "qr"
                  ? "bg-[var(--color-neon-gold)] text-[var(--color-deep-navy)]"
                  : "border border-white/10 bg-white/5 text-white/70"
              }`}
            >
              Scan QR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeTab === "password"
                  ? "bg-[var(--color-neon-gold)] text-[var(--color-deep-navy)]"
                  : "border border-white/10 bg-white/5 text-white/70"
              }`}
            >
              Password Login
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === "qr" ? (
            <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <div className="mx-auto flex h-64 w-full max-w-[16rem] items-center justify-center rounded-[1.7rem] border border-[var(--color-neon-gold)] bg-[linear-gradient(145deg,rgba(255,215,0,0.12),rgba(0,13,29,0.8))] p-4 shadow-[0_0_24px_rgba(255,215,0,0.16)]">
                <div className="grid h-full w-full grid-cols-7 gap-2 rounded-[1.2rem] bg-[#051a31] p-4">
                  {Array.from({ length: 49 }).map((_, index) => {
                    const highlighted = [
                      0, 1, 2, 4, 6, 8, 9, 11, 14, 16, 17, 20, 22, 24, 26, 27,
                      28, 30, 33, 34, 36, 39, 40, 42, 44, 46, 48,
                    ].includes(index);

                    return (
                      <span
                        key={index}
                        className={`rounded-[0.3rem] ${
                          highlighted ? "bg-[var(--color-neon-gold)]" : "bg-white/10"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white">Scan from the mobile app</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  Open Bayright9ja on your phone, tap the secure web sync action,
                  and scan this code to unlock your dashboard in seconds.
                </p>
                <div className="mt-6 rounded-[1.4rem] border border-[var(--color-prosperity-green)]/25 bg-[var(--color-prosperity-green)]/8 p-4 text-sm leading-7 text-[var(--color-prosperity-green)]">
                  Device binding, KYC checks, and wallet context stay protected
                  when you enter through QR sync.
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/78">
                  Email / Username
                </label>
                <input
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  placeholder="Enter your email or Bayright tag"
                  className="glass-input w-full rounded-[1.3rem] px-5 py-4 text-white outline-none placeholder:text-white/35"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/78">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  className="glass-input w-full rounded-[1.3rem] px-5 py-4 text-white outline-none placeholder:text-white/35"
                />
              </div>
              <button
                type="button"
                onClick={handlePasswordLogin}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-neon-gold)] px-6 py-4 text-base font-bold text-[var(--color-deep-navy)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing you in..." : "Login Securely"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

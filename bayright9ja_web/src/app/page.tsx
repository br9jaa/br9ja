"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Cable, Landmark, RadioTower, ShieldCheck, SunMedium, Tv } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/context/AuthContext";

const serviceCards = [
  {
    title: "Renewable Energy",
    body: "Manage solar subscriptions, hardware support, and power payments in one secure utility vault.",
    icon: SunMedium,
  },
  {
    title: "TV Streaming",
    body: "Renew DSTV, GOTV, StarTimes, and streaming plans with a premium bill-payment flow.",
    icon: Tv,
  },
  {
    title: "Internet Fiber",
    body: "Handle FiberOne, ipNX, VDT, and broadband services with fast account verification.",
    icon: Cable,
  },
  {
    title: "Government Fees",
    body: "Pay education and public service references with the same high-trust Bayright security rails.",
    icon: Landmark,
  },
];

const securityItems = [
  {
    title: "Device Binding",
    body: "Every session is tied to trusted user context before sensitive actions are approved.",
  },
  {
    title: "256-bit Encryption",
    body: "Transaction flows are wrapped in strong encrypted channels built for modern fintech expectations.",
  },
  {
    title: "CBN-Compliant KYC Gates",
    body: "Tiered transaction limits and identity upgrade prompts protect high-value transfers automatically.",
  },
];

export default function Home() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");

  const qrPattern = useMemo(
    () =>
      Array.from({ length: 49 }).map((_, index) =>
        [0, 1, 2, 4, 6, 7, 9, 10, 12, 14, 16, 18, 20, 21, 22, 24, 26, 28, 30, 31, 33, 35, 36, 38, 40, 42, 43, 45, 46, 48].includes(index),
      ),
    [],
  );

  const handleLandingLogin = async () => {
    await login({
      identity: "member@bayright9ja.com",
      password: "password",
    });
    router.push("/dashboard");
  };

  const handleInlineLogin = async () => {
    await login({
      identity: identity || "member@bayright9ja.com",
      password: password || "password",
    });
    router.push("/dashboard");
  };

  return (
    <>
      <main className="relative overflow-hidden bg-[var(--color-deep-navy)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(76,175,80,0.14),_transparent_18%),linear-gradient(135deg,_rgba(255,255,255,0.04)_0%,_transparent_40%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-12 opacity-55">
          <img
            src="/assets/processed_br9ja_hero_desktop.webp"
            alt="BR9ja hero background"
            className="h-full w-full object-contain object-bottom"
          />
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-14">
          <header className="glass mb-12 flex items-center justify-between rounded-full px-5 py-3">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/assets/logo_web_header.webp"
                alt="BR9ja"
                className="navbar-logo"
              />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-neon-gold)]">
                  BR9ja
                </p>
                <p className="text-sm text-white/60">
                  App-first games. Web-first bills.
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-[var(--color-neon-gold)]/30 bg-[var(--color-neon-gold)]/10 px-4 py-2 text-sm font-medium text-[var(--color-neon-gold)] md:block">
                Nigeria-first premium bill stack
              </div>
              <button
                type="button"
                onClick={handleLandingLogin}
                className="rounded-full border border-[var(--color-neon-gold)]/30 bg-[var(--color-neon-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--color-deep-navy)] transition hover:brightness-110"
              >
                Login
              </button>
            </div>
          </header>

          <section className="grid items-center gap-10 pb-18 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="inline-flex rounded-full border border-[var(--color-prosperity-green)]/35 bg-[var(--color-prosperity-green)]/10 px-4 py-2 text-sm font-medium text-[var(--color-prosperity-green)]">
                Solar, Fiber, Streaming, Transfers
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight text-[var(--color-neon-gold)] sm:text-6xl">
                  Play Games. Pay Bills. Get Paid.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                  BR9ja keeps gameplay exclusive to the mobile app while web stays sharp for bill payments, wallet control, and secure profile access.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#"
                  className="glass-button inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <ArrowRight className="h-5 w-5 text-[var(--color-neon-gold)]" />
                  Start Gaming on Mobile
                </a>
                <a
                  href="#"
                  className="glass-button inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5"
                >
                  <RadioTower className="h-5 w-5 text-[var(--color-neon-gold)]" />
                  Open Bills on Web
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.56 }}
              className="glass rounded-[2rem] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)]"
            >
              <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,215,0,0.08),rgba(255,255,255,0.02))] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-neon-gold)]">
                    Login to Web
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72 transition hover:border-[var(--color-neon-gold)]/35 hover:text-[var(--color-neon-gold)]"
                  >
                    Open Login
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInlineLogin((current) => !current)}
                  className="mx-auto mt-6 block rounded-[1.8rem] border border-[var(--color-neon-gold)] bg-[linear-gradient(145deg,rgba(255,215,0,0.14),rgba(0,13,29,0.72))] p-5 shadow-[0_0_0_1px_rgba(255,215,0,0.25),0_0_30px_rgba(255,215,0,0.18)] gold-pulse"
                >
                  <div className="grid h-[16rem] w-[16rem] grid-cols-7 gap-2 rounded-[1.4rem] bg-[#04182f] p-4">
                    {qrPattern.map((highlighted, index) => (
                      <span
                        key={index}
                        className={`rounded-[0.35rem] ${
                          highlighted ? "bg-[var(--color-neon-gold)]" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </button>
                <p className="mt-6 text-center text-sm leading-7 text-white/72">
                  Already a member? Open the Bayright9ja app and scan this code to access your dashboard on the web.
                </p>
                <button
                  type="button"
                  onClick={() => setShowInlineLogin((current) => !current)}
                  className="mx-auto mt-4 block text-sm font-semibold text-[var(--color-neon-gold)] underline underline-offset-4"
                >
                  Login with Password
                </button>

                <AnimatePresence>
                  {showInlineLogin ? (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 14 }}
                      className="glass mt-5 space-y-4 rounded-[1.5rem] p-4"
                    >
                      <input
                        value={identity}
                        onChange={(event) => setIdentity(event.target.value)}
                        placeholder="Email / Username"
                        className="glass-input w-full rounded-[1.1rem] px-4 py-3 text-sm outline-none"
                      />
                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        type="password"
                        className="glass-input w-full rounded-[1.1rem] px-4 py-3 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleInlineLogin}
                        className="w-full rounded-full bg-[var(--color-neon-gold)] px-4 py-3 text-sm font-semibold text-[var(--color-deep-navy)]"
                      >
                        Secure Login
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </section>

          <section className="pb-18">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-neon-gold)]">
                  Service Showcase
                </p>
                <h2 className="mt-2 text-3xl font-bold">Utility cards with real depth</h2>
              </div>
              <p className="hidden max-w-xl text-right text-sm leading-7 text-white/60 md:block">
                Built to mirror the same premium service clusters from Bayright9ja mobile, now optimized for browser-first discovery.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {serviceCards.map((card) => {
                const Icon = card.icon;

                return (
                  <motion.article
                    whileHover={{ y: -6 }}
                    key={card.title}
                    className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(160deg,rgba(10,34,61,0.95),rgba(3,18,33,0.92))] p-6 transition duration-300 hover:border-[var(--color-neon-gold)]/35 hover:shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-neon-gold),var(--color-prosperity-green))]" />
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-neon-gold)]/30 bg-[var(--color-neon-gold)]/10 text-[var(--color-neon-gold)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{card.body}</p>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section className="pb-16">
            <div className="card-depth rounded-[2rem] p-7 backdrop-blur-xl sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-prosperity-green)]">
                Trust & Security
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">Security rails built into every session</h2>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {securityItems.map((item) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-[#06172a] p-5">
                    <ShieldCheck className="mb-4 h-10 w-10 text-[var(--color-prosperity-green)]" />
                    <h3 className="text-lg font-bold text-[var(--color-neon-gold)]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="mt-auto flex flex-col gap-5 border-t border-white/10 py-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-5">
              <a href="#" className="transition hover:text-[var(--color-neon-gold)]">
                Privacy Policy
              </a>
              <a href="#" className="transition hover:text-[var(--color-neon-gold)]">
                Terms of Service
              </a>
              <a href="#" className="transition hover:text-[var(--color-neon-gold)]">
                Support
              </a>
            </div>
            <p>Bayright9ja Ltd - A Registered Company.</p>
          </footer>
        </div>
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}

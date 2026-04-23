"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  Eye,
  EyeOff,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/transfer", label: "Transfer", icon: ArrowLeftRight },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/services", label: "Biller", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Security", icon: Shield },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isAuthenticated,
    isReady,
    user,
    walletBalance,
    revenueBalance,
    commissionEarned,
    balanceVisible,
    dashboardMode,
    lastLogin,
    referralLink,
    toggleBalanceVisibility,
    toggleDashboardMode,
    logout,
  } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const [idleDeadline, setIdleDeadline] = useState<number | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isReady, router]);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let countdownTimer: ReturnType<typeof setInterval>;

    const startIdleCountdown = () => {
      clearTimeout(idleTimer);
      clearInterval(countdownTimer);
      setShowIdlePrompt(false);
      setIdleDeadline(null);

      idleTimer = setTimeout(() => {
        const deadline = Date.now() + 30_000;
        setIdleDeadline(deadline);
        setShowIdlePrompt(true);

        countdownTimer = setInterval(() => {
          if (Date.now() >= deadline) {
            clearInterval(countdownTimer);
            logout();
            router.push("/");
          }
        }, 1000);
      }, 5 * 60 * 1000);
    };

    const events: Array<keyof WindowEventMap> = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, startIdleCountdown));
    startIdleCountdown();

    return () => {
      clearTimeout(idleTimer);
      clearInterval(countdownTimer);
      events.forEach((eventName) => window.removeEventListener(eventName, startIdleCountdown));
    };
  }, [logout, router]);

  useEffect(() => {
    if (!copiedReferral) {
      return undefined;
    }

    const timer = setTimeout(() => setCopiedReferral(false), 2200);
    return () => clearTimeout(timer);
  }, [copiedReferral]);

  const formattedBalance = useMemo(() => {
    const activeBalance = dashboardMode === "business" ? revenueBalance : walletBalance;

    return balanceVisible
      ? `₦${activeBalance.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₦••••••••";
  }, [balanceVisible, dashboardMode, revenueBalance, walletBalance]);

  const modeLabel = dashboardMode === "business" ? "Total Revenue" : "Wallet Balance";
  const countdown = idleDeadline ? Math.max(0, Math.ceil((idleDeadline - Date.now()) / 1000)) : 0;

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-deep-navy)] text-white">
        Loading secure workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-deep-navy)] text-white">
      <CommandPalette />

      <div className="flex min-h-screen">
        <aside
          className={`glass fixed inset-y-0 left-0 z-40 flex w-[19rem] flex-col border-r border-[var(--color-neon-gold)]/12 bg-[linear-gradient(180deg,rgba(0,13,29,0.96),rgba(3,20,39,0.92))] px-5 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.4)] transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-neon-gold)]">
                Bayright9ja
              </p>
              <p className="text-sm text-white/55">Vault Dashboard</p>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={toggleDashboardMode}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                dashboardMode === "personal"
                  ? "bg-[var(--color-neon-gold)] text-[var(--color-deep-navy)]"
                  : "text-white/65"
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={toggleDashboardMode}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                dashboardMode === "business"
                  ? "bg-[var(--color-neon-gold)] text-[var(--color-deep-navy)]"
                  : "text-white/65"
              }`}
            >
              Business
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 rounded-[1.35rem] px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border border-[var(--color-neon-gold)]/40 bg-[rgba(255,215,0,0.12)] text-white shadow-[0_0_24px_rgba(255,215,0,0.12)]"
                      : "border border-transparent text-white/58 hover:border-white/8 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active ? "text-[var(--color-neon-gold)]" : "text-white/42"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-neon-gold)]">
                Invite & Earn
              </p>
              <Sparkles className="h-4 w-4 text-[var(--color-prosperity-green)]" />
            </div>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Grow your Bayright9ja network and earn commission from every secured referral.
            </p>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(referralLink);
                setCopiedReferral(true);
              }}
              className="mt-4 w-full rounded-full border border-[var(--color-prosperity-green)]/35 bg-[var(--color-prosperity-green)]/15 px-4 py-3 text-sm font-semibold text-[var(--color-prosperity-green)] transition hover:bg-[var(--color-prosperity-green)] hover:text-[var(--color-deep-navy)]"
            >
              Copy Referral Link
            </button>
          </div>

          <div className="mt-auto space-y-4 rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-prosperity-green)]">
                Secure Session
              </p>
              <p className="mt-2 text-sm text-white/65">Last Login</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {lastLogin
                  ? new Date(lastLogin).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Just now"}
              </p>
            </div>

            {dashboardMode === "business" ? (
              <div className="rounded-[1.25rem] border border-white/8 bg-[#06172a] p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-white/45">
                  Commission Earned
                </p>
                <p className="mt-2 text-xl font-black text-[var(--color-neon-gold)]">
                  ₦{commissionEarned.toLocaleString("en-NG")}
                </p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/72 transition hover:border-[var(--color-neon-gold)]/28 hover:text-[var(--color-neon-gold)]"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-neon-gold)]/30 bg-[var(--color-neon-gold)]/10 px-4 py-3 text-sm font-semibold text-[var(--color-neon-gold)] transition hover:bg-[var(--color-neon-gold)] hover:text-[var(--color-deep-navy)]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[19rem]">
          <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[rgba(0,13,29,0.88)] px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--color-neon-gold)] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-prosperity-green)]">
                  {modeLabel}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-xl font-black text-white sm:text-2xl">{formattedBalance}</p>
                  <button
                    type="button"
                    onClick={toggleBalanceVisibility}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition hover:border-[var(--color-neon-gold)]/35 hover:text-[var(--color-neon-gold)]"
                  >
                    {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-neon-gold)]/35 bg-[var(--color-neon-gold)]/10 font-bold text-[var(--color-neon-gold)]">
                {user?.name?.charAt(0) ?? "B"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name ?? "Member"}</p>
                <p className="text-xs text-white/55">
                  {dashboardMode === "business" ? "Agent Console" : "Tier 2 Verified"}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      <AnimatePresence>
        {copiedReferral ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-24 right-4 z-[90] rounded-full border border-[var(--color-prosperity-green)]/40 bg-[var(--color-prosperity-green)] px-5 py-3 text-sm font-semibold text-[var(--color-deep-navy)] shadow-[0_15px_30px_rgba(76,175,80,0.35)]"
          >
            Link copied! Share the Bayright9ja magic.
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showIdlePrompt ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 px-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="glass w-full max-w-lg rounded-[2rem] p-6 text-white"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-neon-gold)]">
                Secure Session
              </p>
              <h3 className="mt-3 text-2xl font-bold">Are you still there?</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">
                Your session will lock in about {countdown} seconds for safety if there is no
                response.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowIdlePrompt(false);
                    setIdleDeadline(null);
                  }}
                  className="flex-1 rounded-full bg-[var(--color-neon-gold)] px-4 py-3 text-sm font-semibold text-[var(--color-deep-navy)]"
                >
                  Continue Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="flex-1 rounded-full border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="glass fixed bottom-4 left-1/2 z-30 flex w-[min(92vw,28rem)] -translate-x-1/2 items-center justify-around rounded-full px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-xs text-[var(--color-neon-gold)]">
          <Home className="h-5 w-5" />
          Home
        </Link>
        <Link href="/dashboard/history" className="flex flex-col items-center gap-1 text-xs text-white/65">
          <History className="h-5 w-5" />
          History
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1 text-xs text-white/65">
          <UserCircle2 className="h-5 w-5" />
          Profile
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bolt,
  Cable,
  Landmark,
  RadioTower,
  SunMedium,
  Tv,
} from "lucide-react";
import { UserIdentityCard } from "@/components/UserIdentityCard";
import { useAuth } from "@/context/AuthContext";

const quickActions = [
  { title: "Solar", icon: SunMedium, href: "/dashboard/services?query=solar" },
  { title: "Electricity", icon: Bolt, href: "/dashboard/services?query=electricity" },
  { title: "Fiber", icon: Cable, href: "/dashboard/services?query=fiber" },
  { title: "TV", icon: Tv, href: "/dashboard/services?query=tv" },
  { title: "Airtime", icon: RadioTower, href: "/dashboard/payments" },
];

const transactions = [
  { service: "MTN Airtime", date: "09 Apr 2026", amount: "₦2,000.00", status: "Success" },
  { service: "DSTV Subscription", date: "08 Apr 2026", amount: "₦12,500.00", status: "Success" },
  { service: "Internal Transfer", date: "08 Apr 2026", amount: "₦25,000.00", status: "Success" },
  { service: "Solar Token", date: "07 Apr 2026", amount: "₦18,900.00", status: "Success" },
  { service: "Govt Fee", date: "06 Apr 2026", amount: "₦7,500.00", status: "Success" },
];

const financialSummary = [
  { label: "Solar", amount: 72, icon: SunMedium },
  { label: "Electricity", amount: 55, icon: Bolt },
  { label: "Airtime", amount: 34, icon: RadioTower },
];

export default function DashboardOverviewPage() {
  const {
    walletBalance,
    revenueBalance,
    commissionEarned,
    balanceVisible,
    dashboardMode,
  } = useAuth();

  const activeValue = dashboardMode === "business" ? revenueBalance : walletBalance;
  const formattedBalance = balanceVisible
    ? `₦${activeValue.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₦••••••••";

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36 }}
        className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(6,20,37,0.96),rgba(7,30,56,0.88))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)]"
      >
        <div className="grid items-center gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-neon-gold)]">
              App Home
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              The dashboard visual your members see after login.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Wallet balance, bill shortcuts, recent activity, and BR9 Gold play stay centered in one premium entry view.
              This image now anchors the authenticated BR9ja landing experience.
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#08162a] p-3">
            <img
              src="/br9/app_home.jpg"
              alt="BR9ja authenticated home preview"
              className="w-full rounded-[1.2rem] object-contain"
            />
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="order-2 xl:order-1"
        >
          <UserIdentityCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48 }}
          className="order-1 space-y-6 xl:order-2"
        >
          <div className="overflow-hidden rounded-[2rem] border border-[var(--color-prosperity-green)]/28 bg-[linear-gradient(140deg,rgba(76,175,80,0.28),rgba(13,59,34,0.96))] p-6 shadow-[0_18px_50px_rgba(37,94,41,0.3)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/78">
                  {dashboardMode === "business" ? "Total Revenue" : "Wallet Balance"}
                </p>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
                  {formattedBalance}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/70">
                  {dashboardMode === "business"
                    ? "Track incoming volume and earned commissions from your Bayright9ja agent network."
                    : "Prosperity-ready liquidity across transfers, utilities, and your premium digital vault."}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-white/58">
                  Commission
                </p>
                <p className="mt-2 text-xl font-black text-[var(--color-neon-gold)]">
                  ₦{commissionEarned.toLocaleString("en-NG")}
                </p>
              </div>
            </div>
          </div>

          <div className="card-depth rounded-[2rem] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-neon-gold)]">
                  Quick Actions
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Launch your priority services
                </h2>
              </div>
              <Link
                href="/dashboard/services"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/72 transition hover:border-[var(--color-neon-gold)]/28 hover:text-[var(--color-neon-gold)]"
              >
                All Billers
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group rounded-[1.5rem] border border-white/10 bg-[#071a31] p-4 transition hover:-translate-y-1 hover:border-[var(--color-neon-gold)]/32 hover:shadow-[0_16px_30px_rgba(0,0,0,0.22)]"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-neon-gold)]/12 text-[var(--color-neon-gold)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-white">{action.title}</p>
                    <p className="mt-2 text-xs leading-6 text-white/55">
                      Open the secure payment flow instantly.
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52 }}
          className="card-depth rounded-[2rem] p-6"
        >
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-[var(--color-prosperity-green)]" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-prosperity-green)]">
                Financial Summary
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">Monthly spend focus</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {financialSummary.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-neon-gold)]/10 text-[var(--color-neon-gold)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-white">{item.label}</span>
                    </div>
                    <span className="text-sm text-white/58">{item.amount}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.amount}%` }}
                      transition={{ duration: 0.65, ease: "easeOut" }}
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-neon-gold),var(--color-prosperity-green))]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.article>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58 }}
          className="card-depth rounded-[2rem] p-6"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-prosperity-green)]">
                Recent Activity
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">Your last five transactions</h2>
            </div>
            <Link
              href="/dashboard/history"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/68 transition hover:border-[var(--color-neon-gold)]/35 hover:text-[var(--color-neon-gold)]"
            >
              View History
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/48">
                  <th className="pb-4 pr-4 font-medium">Service</th>
                  <th className="pb-4 pr-4 font-medium">Date</th>
                  <th className="pb-4 pr-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.service + transaction.date} className="border-b border-white/6">
                    <td className="py-4 pr-4 font-semibold text-white">{transaction.service}</td>
                    <td className="py-4 pr-4 text-white/56">{transaction.date}</td>
                    <td className="py-4 pr-4 text-white/78">{transaction.amount}</td>
                    <td className="py-4">
                      <span className="rounded-full border border-[var(--color-prosperity-green)]/35 bg-[var(--color-prosperity-green)]/12 px-3 py-1 text-xs font-bold text-[var(--color-prosperity-green)]">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </section>
    </div>
  );
}

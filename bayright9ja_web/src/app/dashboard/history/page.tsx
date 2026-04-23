import { WebReceipt } from "@/components/WebReceipt";

const transactions = [
  {
    service: "Internal Transfer",
    date: "09 Apr 2026, 8:43 PM",
    amount: "₦25,000.00",
    status: "Success",
    reference: "BR9-INT-77821",
  },
  {
    service: "DStv Compact",
    date: "08 Apr 2026, 11:20 AM",
    amount: "₦12,500.00",
    status: "Success",
    reference: "BR9-TV-55192",
  },
];

export default function HistoryPage() {
  return (
    <section className="space-y-6 text-white">
      <div className="card-depth rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-neon-gold)]">
          History
        </p>
        <h1 className="mt-3 text-3xl font-bold">Transaction archive</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
          Review your successful payments and open a clean browser-friendly receipt for printing or PDF export.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-depth rounded-[2rem] p-6">
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
                <tr key={transaction.reference} className="border-b border-white/6">
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

        <WebReceipt {...transactions[0]} />
      </div>
    </section>
  );
}

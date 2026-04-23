type WebReceiptProps = {
  service: string;
  date: string;
  amount: string;
  status: string;
  reference: string;
};

export function WebReceipt({
  service,
  date,
  amount,
  status,
  reference,
}: WebReceiptProps) {
  return (
    <article className="print-receipt rounded-[1.75rem] border border-[#d9c488] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-[#d8c89c] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7b6b2c]">
            Bayright9ja Receipt
          </p>
          <h3 className="mt-3 text-2xl font-black text-[#11243a]">Payment Successful</h3>
        </div>
        <div className="rounded-full border border-[#cfe6d0] bg-[#eaf7eb] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2e7d32]">
          {status}
        </div>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-[#334a62] sm:grid-cols-2">
        <div>
          <p className="text-[#7e8a96]">Service</p>
          <p className="mt-1 font-bold text-[#11243a]">{service}</p>
        </div>
        <div>
          <p className="text-[#7e8a96]">Date</p>
          <p className="mt-1 font-bold text-[#11243a]">{date}</p>
        </div>
        <div>
          <p className="text-[#7e8a96]">Amount</p>
          <p className="mt-1 font-bold text-[#11243a]">{amount}</p>
        </div>
        <div>
          <p className="text-[#7e8a96]">Reference</p>
          <p className="mt-1 font-bold text-[#11243a]">{reference}</p>
        </div>
      </div>
    </article>
  );
}

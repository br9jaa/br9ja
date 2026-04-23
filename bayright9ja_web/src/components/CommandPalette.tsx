"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const commands = [
  { label: "Pay Solar", href: "/dashboard/services?query=solar" },
  { label: "View History", href: "/dashboard/history" },
  { label: "Contact Support", href: "/" },
  { label: "Open Biller Directory", href: "/dashboard/services" },
  { label: "Request Money", href: "/dashboard/transfer" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredCommands = useMemo(
    () =>
      commands.filter((command) =>
        command.label.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[rgba(0,0,0,0.65)] p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass mx-auto mt-20 w-full max-w-2xl rounded-[2rem] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="glass-input flex items-center gap-3 rounded-[1.4rem] px-4 py-3">
              <Search className="h-5 w-5 text-[var(--color-neon-gold)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Jump to Pay Solar, View History, or Contact Support"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
              />
            </div>

            <div className="mt-4 space-y-2">
              {filteredCommands.map((command) => (
                <button
                  key={command.href + command.label}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(command.href);
                  }}
                  className="flex w-full items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/5 px-4 py-3 text-left text-white transition hover:border-[var(--color-neon-gold)]/35 hover:bg-[var(--color-neon-gold)]/10"
                >
                  <span>{command.label}</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Enter
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

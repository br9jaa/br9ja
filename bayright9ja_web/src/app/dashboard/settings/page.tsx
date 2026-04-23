export default function SettingsPage() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#071a31] p-6 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-neon-gold)]">
        Settings
      </p>
      <h1 className="mt-3 text-3xl font-bold">Profile and security settings</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
        Device trust, PIN management, and future web preferences will live in
        this secure settings space.
      </p>
    </section>
  );
}

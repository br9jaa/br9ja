export function renderHero() {
  return `
    <section class="hub-hero hero-br9">
      <div class="hero-br9__background">
        <img
          src="assets/processed_br9ja_hero_desktop.webp"
          alt="BR9ja homepage hero showing mobile gaming and bill payment"
          class="hero-br9__image"
        >
      </div>

      <div class="hero-br9__content">
        <div class="hub-nav">
          <div class="hub-nav__brand">
            <img
              src="assets/logo_web_header.webp"
              alt="BR9ja"
              class="navbar-logo"
            >
            <div class="hub-nav__brand-copy">
              <strong>BR9ja</strong>
              <span>Powered by BayRight9ja Ltd</span>
            </div>
          </div>
          <div class="hub-nav__links" aria-label="Primary navigation">
            <span>Quick Bill Pay</span>
            <span>Games in App</span>
            <span>Profile</span>
          </div>
        </div>

        <div class="hub-kicker">April 2026 Brand Refresh</div>
        <h1>Play for BR9 Gold, Pay Your Bills and Win.</h1>
        <p>
          BR9ja gives you one sharp flow for daily essentials, wallet confidence, and Market Runner
          rewards. Play happens in the mobile app, while the web stays fast for quick payments,
          profile access, and clear account control.
        </p>

        <div class="hero-metrics" aria-label="BR9ja highlights">
          <article class="hero-metric">
            <strong>1,000 BR9 Gold</strong>
            <span>Weekly benchmark to unlock Monday cashout</span>
          </article>
          <article class="hero-metric">
            <strong>₦20k Sunday Prize</strong>
            <span>Live winner headline for the community spotlight</span>
          </article>
          <article class="hero-metric">
            <strong>6-digit Quick Login</strong>
            <span>Return with PIN, biometrics, pattern, or device unlock</span>
          </article>
        </div>

        <div class="hub-cta-row">
          <button class="hub-cta hub-cta--primary" type="button" data-br9-action="start-gaming">
            Start Gaming Now
          </button>
          <button class="hub-cta hub-cta--secondary" type="button" data-br9-action="quick-bill-pay">
            Quick Bill Pay
          </button>
        </div>

        <div class="hub-store-row">
          <button class="hub-mini-link hub-mini-link--button" type="button" data-br9-action="download-play">
            Download on Play Store
          </button>
          <button class="hub-mini-link hub-mini-link--button" type="button" data-br9-action="download-ios">
            Download on App Store
          </button>
          <button class="hub-mini-link hub-mini-link--button" type="button" data-br9-action="open-web-wallet">
            Open Web Wallet
          </button>
        </div>

        <div class="hub-chip-row">
          <span class="hub-chip">Games are mobile-only</span>
          <span class="hub-chip">Pay bills with clear labels</span>
          <span class="hub-chip">Profile-first fintech dashboard</span>
        </div>
      </div>
    </section>
  `;
}

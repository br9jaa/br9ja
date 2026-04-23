export function renderTrustSection() {
  return `
    <section class="hub-ticker" aria-label="Live winners feed">
      <div class="hub-ticker__mask">
        <div class="hub-ticker__track">
          <span>🔥 @chidi_9ja just earned ₦500 airtime cashback</span>
          <span>🏆 @sade_dev converted 5,000 BR9 Gold into wallet cash</span>
          <span>⚡ @tunde_fix just cleared an electricity bill in seconds</span>
          <span>🎮 @amara.gold moved up the Market Runner leaderboard</span>
          <span>💛 Monday cashout opens once you hit 1,000 BR9 Gold</span>
          <span>🔥 @chidi_9ja just earned ₦500 airtime cashback</span>
          <span>🏆 @sade_dev converted 5,000 BR9 Gold into wallet cash</span>
          <span>⚡ @tunde_fix just cleared an electricity bill in seconds</span>
        </div>
      </div>
    </section>

    <section class="partner-bar" aria-label="Trust and payment compatibility">
      <span class="partner-pill">Moniepoint-ready</span>
      <span class="partner-pill">Kuda-style clarity</span>
      <span class="partner-pill">Mastercard-compatible flows</span>
      <span class="partner-pill">Sunday Prize Proof</span>
    </section>

    <div class="homepage-body">
      <section class="body-block homepage-grid">
        <article class="section-panel">
          <div class="section-header">
            <span class="hub-kicker">Service Marketplace</span>
            <h2>The essentials, without guesswork or vague forms.</h2>
            <p>
              Every quick action is explicit, calm, and mobile-friendly. Type the right detail once,
              see the success state immediately, and move straight into checkout.
            </p>
          </div>

          <div class="service-grid">
            <article class="service-card">
              <div class="service-card__top">
                <span class="service-icon">📱</span>
                <div>
                  <h3>Airtime & Data</h3>
                  <p>Fast top-up with instant phone number validation.</p>
                </div>
              </div>
              <label for="landing-airtime-phone">Enter Phone Number</label>
              <div class="field-shell">
                <span class="field-prefix">+234</span>
                <input id="landing-airtime-phone" type="tel" placeholder="801 234 5678" data-validate="phone">
              </div>
              <p class="field-status" data-default="We use this to credit your airtime instantly.">
                We use this to credit your airtime instantly.
              </p>
              <button class="service-card__button" type="button" data-br9-action="quick-bill-pay">Top Up Now</button>
            </article>

            <article class="service-card">
              <div class="service-card__top">
                <span class="service-icon">⚡</span>
                <div>
                  <h3>Electricity Bills</h3>
                  <p>Verify the meter number before you spend a single naira.</p>
                </div>
              </div>
              <label for="landing-meter-number">Enter Meter Number</label>
              <div class="field-shell">
                <input id="landing-meter-number" type="text" placeholder="01234567890" data-validate="meter">
              </div>
              <p class="field-status" data-default="Auto-verify keeps the customer name visible before payment.">
                Auto-verify keeps the customer name visible before payment.
              </p>
              <button class="service-card__button" type="button" data-br9-action="quick-bill-pay">Pay Electricity</button>
            </article>

            <article class="service-card">
              <div class="service-card__top">
                <span class="service-icon">📺</span>
                <div>
                  <h3>Cable TV</h3>
                  <p>Decoder-first entry removes confusion at checkout.</p>
                </div>
              </div>
              <label for="landing-decoder-number">Enter Decoder Number</label>
              <div class="field-shell">
                <input id="landing-decoder-number" type="text" placeholder="1234 5678 9012" data-validate="decoder">
              </div>
              <p class="field-status" data-default="We fetch the active bouquet before renewal.">
                We fetch the active bouquet before renewal.
              </p>
              <button class="service-card__button" type="button" data-br9-action="quick-bill-pay">Renew Subscription</button>
            </article>

            <article class="service-card">
              <div class="service-card__top">
                <span class="service-icon">💸</span>
                <div>
                  <h3>Wallet Transfer</h3>
                  <p>Enter the exact amount you want to move in naira.</p>
                </div>
              </div>
              <label for="landing-transfer-amount">Enter Amount in Naira (₦)</label>
              <div class="field-shell">
                <span class="field-prefix">₦</span>
                <input id="landing-transfer-amount" type="number" min="100" step="100" placeholder="5000" data-validate="amount">
              </div>
              <p class="field-status" data-default="Server-ledger checks confirm the amount before transfer.">
                Server-ledger checks confirm the amount before transfer.
              </p>
              <button class="service-card__button" type="button" data-br9-action="quick-bill-pay">Send Money</button>
            </article>
          </div>
        </article>

        <aside class="section-panel benchmark-card">
          <div class="section-header">
            <span class="hub-kicker">Gaming Benchmark</span>
            <h2>Market Runner is now the score that drives BR9 Gold.</h2>
            <p>
              Football prediction is gone. Your weekly benchmark now comes from app-only game play,
              rewarded engagement, and bill activity that proves a real account.
            </p>
          </div>

          <div class="benchmark-progress">
            <div class="benchmark-progress__meta">
              <strong>680 BR9 Gold stacked</strong>
              <span>Goal: 1,000 BR9 Gold = ₦100 Monday cashout</span>
            </div>
            <div class="progress-track" aria-label="BR9 Gold progress to weekly cashout">
              <div class="progress-fill" style="width: 68%;"></div>
            </div>
            <div class="progress-legend">
              <span>0 BR9 Gold</span>
              <span>500 BR9 Gold</span>
              <span>1,000 BR9 Gold</span>
            </div>
          </div>

          <div class="benchmark-pill-row">
            <span class="benchmark-pill">Play Market Runner in the app</span>
            <span class="benchmark-pill">Watch 10 ads to push your progress</span>
            <span class="benchmark-pill">Monday 6AM payout runs automatically</span>
          </div>

          <div class="benchmark-note">
            <strong>Why it converts:</strong>
            <span>People see the target, understand the task, and know exactly what unlocks cashout.</span>
          </div>

          <button class="hub-cta hub-cta--primary benchmark-card__cta" type="button" data-br9-action="start-gaming">
            Open the App to Play
          </button>
        </aside>
      </section>

      <section class="body-block">
        <div class="section-header section-header--center">
          <span class="hub-kicker">How to Earn</span>
          <h2>Three clear steps from first tap to Monday reward.</h2>
          <p>
            We explain BR9ja in one glance so first-time visitors understand the loop before they hit signup.
          </p>
        </div>

        <div class="how-grid">
          <article class="how-card">
            <span class="how-card__step">01</span>
            <h3>Download & Link</h3>
            <p>Install the app, verify your phone, and connect your Moniepoint or Kuda-ready account profile.</p>
          </article>
          <article class="how-card">
            <span class="how-card__step">02</span>
            <h3>Engage & Pay</h3>
            <p>Pay at least one bill, keep your wallet active, and stack BR9 Gold by playing Market Runner.</p>
          </article>
          <article class="how-card">
            <span class="how-card__step">03</span>
            <h3>Automated Monday</h3>
            <p>Wake up to your weekly BR9 Gold conversion or the Sunday prize spotlight once your benchmark is cleared.</p>
          </article>
        </div>
      </section>

      <section class="body-block community-grid">
        <article class="section-panel dashboard-preview">
          <div class="section-header">
            <span class="hub-kicker">Profile Dashboard</span>
            <h2>Fintech clarity with a gaming heartbeat.</h2>
            <p>
              The profile surface keeps Bank Status, Total BR9 Gold, and Daily Streak front and center so
              users understand their standing before they tap anything else.
            </p>
          </div>

          <div class="dashboard-preview__panel">
            <div class="dashboard-preview__header">
              <div>
                <strong>Bank Status</strong>
                <span>Linked and payout-ready</span>
              </div>
              <span class="dashboard-badge">Verified</span>
            </div>
            <div class="dashboard-stats">
              <article>
                <strong>4,850</strong>
                <span>Total BR9 Gold</span>
              </article>
              <article>
                <strong>12 days</strong>
                <span>Daily Streak</span>
              </article>
              <article>
                <strong>₦14,500</strong>
                <span>Wallet Balance</span>
              </article>
            </div>
          </div>
        </article>

        <article class="section-panel community-card">
          <div class="section-header">
            <span class="hub-kicker">Community & Trust</span>
            <h2>Built to feel serious on day one.</h2>
            <p>
              Afrocentric minimalism, proof-driven copy, and clear reward language make BR9ja feel established,
              not experimental.
            </p>
          </div>

          <div class="community-proof-grid">
            <div class="proof-card">
              <strong>₦20,000 Sunday Prize</strong>
              <span>Headline incentive for live community participation</span>
            </div>
            <div class="proof-card">
              <strong>6-digit PIN + biometrics</strong>
              <span>Fast returning login without losing security</span>
            </div>
            <div class="proof-card">
              <strong>Phone verified onboarding</strong>
              <span>Every signup starts with SMS confirmation</span>
            </div>
            <div class="proof-card">
              <strong>App-only gameplay</strong>
              <span>The web stays clean for bills, wallet, and account control</span>
            </div>
          </div>
        </article>
      </section>
    </div>

    <footer class="br9-footer">
      <div class="footer-grid">
        <section class="footer-column footer-column--brand">
          <img src="assets/logo_web_header.webp" alt="BR9ja" class="footer-logo">
          <p>Play for BR9 Gold, Pay Your Bills and Win.</p>
          <span>Powered by BayRight9ja Ltd.</span>
          <span>Registered in Nigeria.</span>
        </section>

        <section class="footer-column">
          <h3>Platform</h3>
          <a href="?play=web#/games">Games</a>
          <a href="?play=web#/airtime">Airtime & Data</a>
          <a href="?play=web#/electricity">Electricity Bills</a>
          <a href="?play=web#/wallet">Quick Wallet Pay</a>
        </section>

        <section class="footer-column">
          <h3>Support</h3>
          <a href="?play=web#/faq">FAQ</a>
          <a href="?play=web#/terms">Terms of Service</a>
          <a href="?play=web#/privacy">Privacy Policy</a>
          <a href="mailto:support@br9.ng">Contact Support</a>
        </section>

        <section class="footer-column">
          <h3>Social</h3>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TikTok</a>
          <a href="https://wa.me/2340000000000" target="_blank" rel="noreferrer">WhatsApp Help</a>
          <a href="mailto:partners@br9.ng">Brand Partnerships</a>
        </section>
      </div>

      <div class="footer-bottom">
        <p>© 2026 BR9JA. All rights reserved. BayRight9ja Ltd is a registered entity.</p>
        <p class="footer-legal-text">
          Rewards are subject to weekly verification, benchmark completion, and fraud review before payout.
        </p>
      </div>
    </footer>
  `;
}

# Check results and limits

Date: October 15, 2026. Agent: Codex (GPT-6 family; runtime does not expose a more precise model/settings identity). Review type: author software checks, synthetic browser execution and agent source/prose review. No independent reviewer or qualified domain acceptance is claimed. Model/tool cost was not exposed.

## Source and scope

Website base: positioning `52fd2c1e59e26d5644fe196a8f70640ca0c1ba7b`, dependent on remote main `a8a0c6a2a82c23b2e99bb3c0828a795a0fd7b35d` (rechecked at end). Original website checkout and positioning worktree retain their changes. No website push, PR, merge, publication or deployment. iBrain context capture, if verified, is separate private project bookkeeping.

Public HTTP checks: apex 200; www 301 to apex; how-we-start 200; 90-day-pilot 301 to how-we-start. Live robots allowed all; sitemap listed four routes. Live homepage H1 remained “We do your insurance billing.” It did not contain the new nationwide hero or growth guides. Homepage SHA-256 `567de95e143b314a5e4deb9ae7391c8528c637e087b691157a7fff37bca001b8` identifies only the fetched bytes, not production source parity. Public responses can undergo Cloudflare transforms. No domain move inferred from the web tool's fetch failures.

Official sources were fetched October 15: Cloudflare analytics/preview/bot docs; Google AI search guidance and June 2026 reporting announcement; Bing's October 13 beta note; OpenAI bot definitions; PostHog pricing/capture API; Stedi enrollment/workflow; CMS payment reassociation; HHS business-associate guidance. PostHog capture docs failed the web reader but were read via direct official HTML and text extraction (HTML SHA-256 `93ed48449a2a8aa199063c0f89ba5db794cfb113ecb35e80ba081b675dbbded9`). The current API documents `/i/v0/e/`, anonymous profile controls and top-level distinct_id; the adapter uses that shape. Pricing is a dated reference, not this account's usage or billing commitment.

## Software checks

`bash scripts/test-claimsnative-pages.sh` runs the existing positioning/copy guards, two www redirect tests, 16 measurement cases, five private-scorecard cases, and built-HTML/link/schema checks. The measurement cases cover source allowlists, PII-looking parameters, repeated query keys, forged referrer hosts, public-path scope, consent/revocation, DNT/GPC/automation, missing config/crypto, expired/invalid state, double loading, retry deduplication and offline failure. The scorecard cases execute duplicate inquiry/receipt handling, spam/test exclusion, qualification/booking evidence, separate cash-week/cohort counts, refunds, unknown sources, first/conversion grouping and Eastern date boundaries.

Eight HTML pages pass canonical/title/description/H1/script and JSON-LD checks; 147 local links/assets/anchors resolve; seven sitemap entries match pages. New graphs use Organization/WebPage and no medical clinic, fabricated review, rating or partnership. Both preview and production builds pass. Preview has noindex meta/header and no sitemap; production preserves public routes and inherited redirects. Local tooling directories are excluded. No new visible raster images require sizing.

Local JSON-LD parsing and content/type checks passed. Google's Rich Results Test, Schema.org Validator, actual Google/Bing rendering/indexing and Cloudflare host-header processing were not submitted or verified. The owner checklist preserves those acceptance steps.

## Browser checks

Playwright/Chromium exercised the built site: all eight pages at 1440, 390 and 320 CSS pixels (24 layouts); no horizontal overflow. Screenshots of home and all three guides at desktop/phone plus the phone consent panel are in `output/playwright/growth/`. Author inspection found readable text, linked sources, visible CTA labels and usable wrapping. `layout-results.json` records measured layouts and warm local timings; those very short local times are not production performance.

An intercepted browser fixture served production-format HTML at the canonical URL without contacting the production site or PostHog. It filled synthetic practice/contact/EHR/free-text fields, gave consent, built the draft twice, inspected the generated mailto and revoked consent. Observed: one form-start and one draft event, plus one deduplicated primary CTA and one footer email action; only allowlisted source/page/CTA fields; safe source labels in the draft; no raw query/form values in analytics; no further event after revocation. CTA and footer links were clicked with default navigation prevented. No email client, signup or scheduling destination was opened. No accepted-inquiry or booking/payment event was emitted. `browser-events-results.json` contains only safe synthetic event evidence.

The first browser attempts hit local cache permissions; a permitted browser launch resolved them. A repeated fixture initially failed because it installed the webdriver test override twice and left route interception active. That was a harness error, not a passing application result. A fresh session and separate layout/event runs passed. A later footer check initially treated URLSearchParams-encoded spaces as missing source text; parsing the mailto body through URLSearchParams fixed that test scorer. The raw failed check is retained locally, and the final decoded-body check passes. Final results are retained. This is a smoke check, not a reliability estimate.

Cold-cache lab review: six runs across the three guides at desktop and phone, recorded in `performance-results.json`. Desktop LCP was 120–128 ms. Phone LCP was 624–628 ms with 4× CPU throttling, 150 ms network latency and 200 KB/s download. CLS was 0 in all six runs. Static subresource transfer was about 54 KB; the HTML document is additional. These are one local run per page/viewport with a synthetic network profile, not a Lighthouse score, field INP, production CWV or a reliability estimate. No new image/font dependency was added.

Browser scripts are saved under `tests/claimsnative-growth/`. Start a clean named Playwright CLI session, serve the production-format artifact on localhost:4187, then run browser-layout.js, browser-events.js and browser-performance.js through `playwright-cli run-code --filename`. The event script intercepts every destination and uses a synthetic token; it must never be modified to forward requests to production. Screenshots/results belong in output/playwright/growth, not the marketing build.

## Product/content review

The eval contract was set before implementation. Each guide has a direct answer, practical steps, current scope limits, a next step and visible primary sources. Source/prose review checked that no direct/native EHR support, payer readiness, recovered money, reviews or medical-provider status was invented. Existing positioning assertions about live posting, eligibility and ChiroHD remain explicitly unproved in the separate handoff; this work does not validate them. The three new guide pages qualify EHR access and bank/payment proof. The 30-day plan and manual questions are proposals, not executed distribution or AI-platform monitoring.

## Unverified outcomes

Collector configuration/consent-policy approval, live PostHog ingestion, Web Analytics dashboard state, bot/WAF account settings, verified crawler IP access, search-console ownership/data, platform AI visibility, real inbox receipts, qualified customers, bookings, pilots, settled revenue and search/ranking changes remain unverified. Manual AI-answer checks were not run. No paid service or external contact was used. These limits prevent any claim of production or business completion; the local review package is the deliverable.

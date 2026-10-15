# Stack recommendation and inspection

Checked October 15, 2026. Keep the static site, Cloudflare Web Analytics for traffic/performance and the existing PostHog account for a few public events. Use the existing inbox and a private lead ledger for the inquiry-to-customer join. Do not add GA4, a tag manager, session replay, a new dashboard or an AI monitoring subscription.

## What exists

| Item | Evidence and finding |
| --- | --- |
| Repository/framework | `ihint/atomandbitsweb`; plain HTML/CSS/JS. Claims Native lives in `claimsnative/`, separate from the Atom & Bits root. No application framework or marketing backend. Read `CLAUDE.md`; no tracked AGENTS.md found. |
| Canonical | `cloudflare-pages/infrastructure.json`, the www Worker and build transforms name `https://claimsnative.com`. October 15 HTTP: apex 200, www 301 to apex. Source uses Atom & Bits URLs which the dedicated build rewrites. No domain move is needed. |
| Hosting/release | Pages project `claimsnative`; `.github/workflows/claimsnative-cloudflare.yml` tests then deploys main via Wrangler 4.125.0, with a production environment, account variable and token secret. The same workflow deploys a separate www redirect Worker. No deploy was run. |
| Routes | Positioning base: `/`, `/how-we-start/`, `/chiropractors/`, `/insurance-opportunity/` and 404. Its retired `/90-day-pilot/` and `/independent-practices/` retain 301s. This work adds three guides without removing those routes. |
| Inquiry | Mailto links to the founder. Calculator form shows an editable email draft; it neither POSTs nor saves a lead. Removed its separate dataLayer/DOM event emitter to prevent duplicate counting. |
| Scheduling | No scheduling URL or verified booking flow in marketing source. No booking events emitted. |
| App | Separate `app.claimsnative.com` signup/login, not instrumented here. A signup click does not prove a completed signup or received practice inquiry. |
| Analytics | No GA4, PostHog SDK or Cloudflare beacon in the inspected marketing HTML. Live homepage HTTP contained no beacon; that does not establish dashboard state or exclude conditional edge injection. CSP allowed the Cloudflare script but had no explicit beacon destination. Atom & Bits `site.js` has an empty, optional PostHog config, and is not loaded by Claims Native. iBrain's September app release records an existing PostHog project; live project access/config was not queried. Reuse that account after an owner check. |
| Consent/privacy | No marketing consent controls in base. Existing Privacy link goes to app privacy. This branch adds a tab-scoped opt-in, shown only when configured. Policy text still needs owner review before enablement. |
| Bot controls | Public robots allows all; requests with Googlebot, bingbot, OAI-SearchBot and GPTBot user-agent strings each returned 200. These are spoofable header probes, not verified crawler tests. Zone bot/WAF/AI Crawl Control settings were unavailable and not changed. |

## Smallest stack and alternatives

| Choice | Cost checked today | Maintenance, privacy and attribution |
| --- | --- | --- |
| Cloudflare Web Analytics, retain/verify | Free. No new beacon added without an existing site token/injection inventory. | Existing dashboard for visits and Core Web Vitals. Does not replace a lead record or provide these custom conversions. Check only one beacon loads and reports. [Official overview](https://developers.cloudflare.com/web-analytics/about/). |
| Existing PostHog account, recommended | 1M analytics events/month free; free plan lists one year of retention. Existing account usage/plan unknown. No card or paid upgrade authorized. | Use total event counts and fixed properties through the capture API, without the SDK. No autocapture/replay, person profiles or visitor identity. Shared constant distinct_id means unique users, sessions and person funnels are invalid; use source totals and the lead ledger. Vendor sees network metadata; explicit opt-in and policy review remain required. [Pricing](https://posthog.com/pricing), [capture API](https://posthog.com/docs/api/capture/). |
| Minimal first-party Pages Function + Analytics Engine, alternative only | Analytics Engine Free: 100,000 writes/day, 10,000 read queries/day. Paid includes 10M writes/month, 1M queries/month; overages $0.25/M writes and $1/M queries. Worker request/CPU costs are separate. Three-month event retention. | Could validate a fixed schema on our edge and use SQL/CSV, but needs bindings, storage design, bot controls, deduplication state, query credentials and an operator. More maintenance; sampled analytics complicates exact counts. Still processes request metadata and does not remove consent obligations. No custom endpoint or dashboard built. [Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/), [limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/). |
| Inbox + private lead ledger | No new service spend; proposed 15–30 minutes/week of operator time, not measured. | Carries first/conversion source into received mail and through qualification, booking evidence, pilot and receipts. Works without analytics consent. Unknown source stays unknown. Keep identities and proof links private; report aggregates. |

## Technical changes and remaining checks

Production build keeps canonical, Open Graph and schema URLs on the apex; all eight HTML pages have a single H1 and description. Three guides render their full answer in HTML. Their WebPage/Organization schema matches their content and makes no medical-practice/review/partnership claim. Existing Service, FAQPage and HowTo schema is retained; it does not establish eligibility for rich results.

Seven sitemap URLs have crawlable internal links. 404 is noindex. Preview builds default to noindex and no sitemap. Explicit pages.dev host header rules also cover the production alias, which currently returns 200; verify those response headers after any separately approved release. Robots training preferences remain unchanged. Local private-tool folders are excluded from build artifacts. The CSP adds only the two fixed PostHog ingestion hosts and Cloudflare's beacon destination; it removes no existing security directive. This is reviewable source configuration, not an applied security change.

Existing page content is already server-delivered static HTML. No remote fonts or new image dependency was added. New guides use text and existing styles; large OG images are metadata assets rather than visible hero images. No visible raster image was added. Desktop/mobile layout and lab checks are in proof; real-user performance needs the existing Web Analytics dashboard after a release.

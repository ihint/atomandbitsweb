# Agent setup checks and remaining decisions

Prepared October 15, 2026. These steps are not executed. No account creation, access change, spend, publication or production action is part of this delivery.

## Inquiry to customer first

1. Have an agent identify the existing approved inbox/CRM as the private source of truth and prepare the weekly reconciliation. Ask Ian only if the records or required authority cannot be established. Create the ledger from `lead-ledger-template.csv` in approved private storage, never in this public repository. Use one internal opportunity key per practice buying decision; merge duplicate email threads there. Capture source labels from received email and the optional reported source, without overwriting one with the other.
2. Count an inquiry only when received, then record qualification evidence, confirmed booking evidence, an agreed pilot start and settled service-payment receipts. Use `payments-template.csv` for distinct receipts/refunds. Keep all identifiers and evidence pointers in private records. The scorecard exports only source-group aggregates. Unknown app-signup source remains unknown.
3. No scheduler is required to start. If one already exists, approve its public booking URL and record confirmation from its actual system/calendar. A future webhook must verify signatures and persist booking IDs idempotently. It is not implemented here.
4. A future server inquiry form needs a durable lead store, validation, spam handling, an idempotency key, acceptance response and consent/retention review. Emit accepted only after commit. Do not add a fake success event to the current mailto form.

## Cloudflare and event analytics

- Inspect the existing Cloudflare Web Analytics site and auto-injection/manual snippets, including edge injection and Pages settings. Keep one existing beacon; if none is enabled, owner setup is needed. No token was invented. Verify a beacon response and dashboard page views/Core Web Vitals. Review its data collection and visitor notices separately from this opt-in.
- Confirm the existing PostHog project, ingestion region, account usage, total-event report and disabled replay/autocapture. The saved app project is historical evidence, not a current access check. Reuse its public project capture token after checking scope; never put a personal/admin API key in growth-config.js. The site's default empty key must remain until policy review is complete.
- Approve retention and processing terms first. Proposed minimum: 30-minute tab source continuity; 90-day raw marketing-event target and weekly aggregates for 13 months, if the existing vendor plan can enforce it. PostHog's published free plan says one-year retention, so verify whether shorter retention/deletion is available. If it is not acceptable, leave capture off and choose the first-party alternative after review. Lead/finance record retention is a separate policy.
- Review the notice below, opt-in wording, DNT/GPC behavior, international visitors, vendor processing, deletion and access. Then fill the existing project token/region in config in a later approved change. Make a saved total-events report using page/source/CTA filters; do not use unique-person or session reports with the shared distinct_id. No new custom dashboard is needed.
- Before any separately approved release: repeat synthetic tests with requests intercepted; review production CSP destinations, canonical redirects and pages.dev noindex headers; run a source scan; confirm the positioning base and source revision. Publishing main triggers the existing deploy workflow, so this branch remains local for review.

## Search Console

- Check whether the configured verification TXT value corresponds to an accessible property. Its presence is not proof of ownership or current data access. Use existing access; no DNS edit or new account here.
- Prefer the existing domain property for claimsnative.com. Submit `https://claimsnative.com/sitemap.xml` once the approved pages are live. Inspect representative URLs, Google's selected canonical, rendered HTML, indexability and any crawl/error reports.
- Export weekly impressions/clicks by query and landing page, with branded queries separated from practice-help intent. Check any available Search Generative AI reports. Google's June 2026 announcement describes limited rollout, so unavailable must be N/A, not zero. Those impressions overlap overall performance; do not sum them. [Official announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports).
- Use Rich Results Test where a supported type applies; use Schema.org Validator for the whole graph. Local parsing is not either platform's acceptance. Do not label the company as a clinic or add ratings/credentials without evidence.

## Bing and AI discovery

- Open existing Bing Webmaster Tools access, or document the owner access step. An import from an already verified Search Console property may be available; no new access was granted here. Submit the canonical sitemap and inspect URLs/crawl issues. IndexNow is optional; do not create a key without owner action.
- Review Search Performance and available AI Performance metrics. The October 13 Topics Portfolio beta may omit small sites or unavailable topics; record N/A and the platform's definitions. Citations and grounding are not clicks or leads. [Bing's current beta note](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/).
- Inspect Cloudflare Security Events, verified-bot handling and AI Crawl Control with read access. Header probes returned 200 but do not verify actual crawler IPs. Check current rules for Googlebot, bingbot and OAI-SearchBot. Propose narrow verified-crawler exceptions only if evidence shows an actual block; do not turn off WAF, challenges or bot protection.
- Keep search access and training choices separate. OAI-SearchBot serves search; GPTBot concerns model training, and ChatGPT-User serves user actions. The current wildcard allow was preserved. No training preference changed. Google-Extended also has a distinct purpose from Googlebot. [OpenAI bot definitions](https://developers.openai.com/api/docs/bots), [Cloudflare AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/).
- Run the manual question set in content-and-experiments.md. No scraping or monitoring subscriptions. Do not make llms.txt a prerequisite; no file was added. Google says its AI search features need no special AI file or schema. [Search guidance](https://developers.google.com/search/docs/appearance/ai-features).

## Draft privacy-policy addition for review

“On our public marketing pages, you can choose whether we send website event counts to PostHog. These counts include the public page category, the button used and approved campaign or referral labels. We do not send your form answers to that analytics service. We do not use session replay or identify you in these events. With your choice, source labels remain in this browser tab for up to 30 minutes between page loads; you can withdraw the choice through Analytics choices in the footer. Our hosting and analytics providers receive technical connection information. Emailing us sends your draft and any source labels you keep in it to our inbox, where we use the inquiry to respond and manage the practice relationship.”

Add the actual retention periods, provider roles, processing regions, rights/contact route and any separate Cloudflare traffic/performance collection after an agent checks the deployed services through approved read access. This draft is not a compliance conclusion and is not published by this change.

## Remaining decisions

Agents prepare the private lead-record mapping, reconciliation, existing PostHog checks and retention options; approve notice/consent before activation; adopt/reconcile the positioning commit and separately open offer/price PRs; decide whether booking integration or a server form is needed after the manual loop has run. Search/platform access and actual Cloudflare bot settings remain owner-access checks. No further product-price claim was added by this work.

## Inherited positioning review still open

The October 15 positioning handoff explicitly flags carried-over claims about live EHR posting, eligibility and ChiroHD as unproved/disabled in the application. Its visit import accepts Claims Native's prescribed layout; an arbitrary EHR export is not established as supported. The nationwide legal review and primary hero CTA choice also remain open. Those are pre-existing positioning questions, not validated service capabilities in this growth work. Keep new pages qualified and resolve those inherited claims before publication. The app's “Another EHR” name and specialty intake need separate app work if desired.

## Agent-first default

Agents own routine source checks, synthetic tests, reconciliation, qualification against agreed criteria, report drafts and cross-review. Use another available agent for a second opinion before asking a person. Human involvement is limited to a decision requiring authority, an unavailable access grant, a required practice signature, or unresolved professional judgment. This grants no permission to contact anyone, publish, enable collection, change production settings or access unapproved records. The website stays unpublished under Ian's current instruction.

The growth review now qualifies the inherited EHR/eligibility/filing claims on the home, setup and chiropractic pages. Their earlier unconditional wording is no longer the proposed growth copy. Price, legal and actual live-service readiness still require evidence or an authorized decision before a later release; agent preparation comes first.

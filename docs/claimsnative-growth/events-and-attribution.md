# Event dictionary and source rules

All event collection is off in this branch's default config. Marketing events are evidence of browser actions only. The private inbox/lead record and payment records remain authoritative.

| Event/state | Exact trigger and deduplication | Implemented scope |
| --- | --- | --- |
| `primary_cta_clicked` | Explicit tagged primary link; fixed `cta_id` and `cta_location`. Same page/event/CTA/location within one second counts once. | Header/signup, hero/how-it-works, body and closing signup links, and guide `start-inquiry` links to the local form. Secondary email links use their own event. |
| `inquiry_form_started` | First input edit in the calculator inquiry form, once per page load. Merely viewing/focusing is not counted. | Browser event only. |
| `inquiry_draft_prepared` | Valid form creates the visible email draft, once per page load. | Diagnostic; never a lead. |
| `inquiry_email_opened` | Click on a fixed founder email link or the draft's Open email link. | The mail client might fail to open; no send or receipt inferred. |
| `inquiry_accepted` | Future server commits a lead and its idempotency key before acknowledging success. | Not emitted: no intake server exists. Today count inbox-received inquiries manually. |
| `scheduling_link_clicked` | Future explicit `data-growth-event="scheduling_link_clicked"`, `data-growth-cta="schedule"` link with a fixed allowed location. | Adapter supported; no scheduler link exists, so no event fires. |
| `booking_confirmed` | Verified scheduling record/webhook, persisted once by provider booking ID in the private ledger. | Manual only when the existing calendar invitation/provider record proves it. No browser confirmation inference. |
| `lead_qualified` | An agent verifies independent-practice fit, billing need, contact authority and a plausible EHR/payer scope from approved private records, recording the date and evidence. Escalate only missing authority or unresolved judgment. | Private lead ledger, once per practice opportunity. Not a public event. |
| `pilot_started` | Agreed scope/price plus recorded start of the pilot, not an account or unsigned proposal. | Private ledger. |
| `payment_received` | Settled receipt for Claims Native's service matched to that opportunity; exclude test mode; subtract refunds in the revenue record. | Private ledger. An invoice sent or insurer payment to a practice is not Claims Native revenue. |

The first inquiry requires a name, email and billing question. Practice details are optional. An estimate enters the draft only when the visitor selects it, either with the checkbox or “Use this estimate.” Preparing a question remains a local draft action. It does not mean the visitor sent an email or the practice qualifies as a lead. The HTML fields and submit button stay disabled until the local draft handler is ready, so a missing script cannot fall back to a GET request containing answers.

## Payload contract

Business properties are limited to `page_path`, `page_category`, `cta_id`, `cta_location`, plus first/conversion prefixes on `referral_source`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Paths must match the seven public routes. Values use fixed registries in growth.js/config. No specialty, EHR, answers, names, email, phone, patient data, practice/account/booking/receipt IDs, full URLs, full referrers, query strings, hashes, user agent, IP address or click IDs are included in business properties. `utm_term`, `gclid`, `fbclid` and arbitrary parameters are ignored.

PostHog transport adds a public project token, event name, per-event UUID and the shared literal distinct_id `public-marketing`; profile processing and geolocation are disabled, and the payload IP is the constant `0.0.0.0`. The UUID is never reused as a visitor or lead ID. No SDK runs, so there is no autocapture, replay, session capture, identify call or automatic page URL. The POST omits credentials and the Referer header. PostHog and Cloudflare still receive connection metadata; inspect account-side processing and retention before enabling. This is data minimization, not a promise that no personal data is processed.

Each event sends at most once. Repeated installation adds no second listeners. Form/draft retries on one page deduplicate; rapid double clicks deduplicate. The event UUID can support vendor ingestion deduplication, but no collector acknowledgment or live ingestion was tested. A failed network attempt is not retried, so counts can undercount. Reloads and repeat visits can count again; there is no unique-visitor measurement in these events. Do not use PostHog's person/session funnels with the shared ID.

## Attribution

Only exact registry campaign values pass; unknown values are dropped, not stored raw. Repeated instances of the same campaign key are dropped. Add a reviewed campaign slug to the registry before using it; never encode a person's name, EHR, specialty, practice or sensitive information in a campaign. `utm_source` takes precedence over a recognized external referrer; otherwise normalize the referrer's hostname into a short source. Unrecognized external sites become `other_referral`; no referrer becomes `direct_unknown`. These are reported labels and can be spoofed.

Before consent, only the current page's source exists in memory. The visitor's explicit email action can place safe source labels in the draft without sending analytics. After consent, this tab stores first touch and latest entry touch. The stored state expires after 30 minutes between page loads. Internal marketing navigation inherits the most recent eligible source, including when only medium/campaign/content labels change. An approved new utm_source replaces that source. A new external/campaign entry updates conversion touch but preserves first touch within that window. A direct entry records `direct_unknown`; it does not silently assign a prior campaign to the conversion. Closing the tab, expired/blocked storage, denied consent, a new browser or another device loses continuity. First touch therefore means first observed consented tab-session touch, not lifetime acquisition.

The optional “How did you hear about us?” select goes only into the email draft/lead record. It stays separate from observed source; an answer of AI assistant does not create a ChatGPT referral. The draft contains labeled first and conversion fields; they may be edited or removed by the sender. Preserve them as reported, not cryptographic attribution proof.

There is no cross-domain tracking added to app signup. Record signup-only opportunities as unknown unless an existing permitted internal record or the practice supplies source evidence. No cross-device or complete AI attribution claim is made. AI referrers can disappear in apps or browser privacy controls; missing evidence stays unknown.

## Exclusions and privacy

Collection requires exact apex host, allowlisted path, configured host/key and an affirmative choice. DNT, GPC and webdriver suppress collection. Preview, localhost, unknown routes and authenticated app hosts cannot send. Known automation is only a partial bot filter; spoofing and public capture-token abuse remain possible. No new WAF rules were applied. Exclude staff tests via a separate intercepted fixture and manual lead test flag; don't test with real PHI or send synthetic production events. Inbox spam and duplicate contacts are excluded before qualifying a practice, using private identities rather than analytics IDs.

Choice is tab-scoped; declining/revoking removes stored source state but keeps page-level retry protection so re-consent cannot count the same form start or draft twice. The source timestamp limits reuse to 30 minutes; stale bytes may remain in sessionStorage until next page load or tab close. No long-lived tracking cookie is set. The present policy link still points to app privacy: approve the draft policy addition in owner-setup.md before activating capture. Consent, notice, lawful processing, vendor terms, access, deletion and retention need review for the audience/jurisdictions. Cookie-free collection alone is not an exemption.

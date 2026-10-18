# Growth foundation checks

Date: 2026-10-15. Request: task 01a1419a-afd8-73c2-9fbe-901c088f4efa.

Outcome: a reviewer can trace a practice inquiry to a later customer using safe source fields and existing lead records. Public event counts must never imply a received inquiry, booking, or payment.

Sources: positioning commit 52fd2c1, current production main a8a0c6a, website build/redirect configuration, public HTTP responses, current official Cloudflare, Google, Bing, OpenAI, PostHog, CMS and Stedi documentation. Product scope comes from source, not vendor capabilities.

Expected behavior: public routes only; fixed event names and property values; no free text or identifiers in analytics; explicit opt-in; campaign values come from a registry; first touch stays fixed during the consented tab session; conversion touch follows the current eligible source. Email drafts carry safe source labels into the existing manual lead process. No invented submission or booking events. Preview builds prohibit indexing. Existing positioning and other branches stay intact.

Critical failures: sensitive payload, raw URL/query/referrer, duplicate event listeners, duplicate form-start event, false success event, changed training preferences/security, outside send, publication/deployment, or overwritten unrelated changes.

Checks: synthetic source/privacy/deduplication/consent cases; actual browser event interception and email draft; production/preview build and internal links/anchors; JSON-LD type/content and canonical/sitemap checks; desktop and phone screenshots, layout and lab performance. Include missing provider config, malformed sources, raw personal-looking campaign values, repeat events, denied consent, storage failure, app paths and preview hosts. Record failures and limitations. Self-review is agent review, not Ian's acceptance. Search rankings, real leads and revenue remain unmeasured.

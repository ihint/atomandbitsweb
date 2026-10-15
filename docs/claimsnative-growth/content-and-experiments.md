# Thirty days of useful content and discovery

Prepared October 15, 2026. Sequence is relative to a separately approved launch. It is a proposed plan, not a publishing or outreach authorization.

## Ranked content map

| Priority | Practice question and buying intent | Deliverable and next step |
| --- | --- | --- |
| 1 | Can I keep my current EHR and get billing help? High purchase friction. | Draft `/keep-your-ehr/`. Direct yes with onboarding qualification; export/access/return-path checks; no claim of a native connection. CTA to discuss setup. |
| 2 | What has to be ready before a new biller can start? Active switching intent. | Draft `/billing-setup/`. Credentialing, participation and transaction enrollment differ; check claim/ERA/EFT routes, approvals and the current biller handoff. Link existing how-we-start. |
| 3 | The payer sent a remittance; why doesn't it match the bank? Concrete need for help. | Draft `/remittance-and-deposits/`. Explanation versus cash, matching trace evidence and unresolved differences. No live bank-connector claim. |
| 4 | Why was my claim rejected rather than denied? Task-specific discovery. | Distinct later guide using actual payer response stages and current CMS/payer/Stedi sources. Do not turn clearinghouse acceptance into adjudication or payment. A short distinction already appears in guide 3. |
| 5 | How do I evaluate a billing service without changing systems? Buyer comparison. | Later checklist: responsibility, scope/fee, access, evidence, handoff and who owns exceptions. Use accepted service terms only; no competitor results or fabricated savings. |
| 6 | Which transaction enrollment do my payers require? Setup intent. | Add a sourced payer-and-transaction checklist to guide 2 after qualified review. No payer-by-state page factory or universal payer support table. |

The first three are separate useful questions, linked from every footer and from relevant body copy. They have direct answers, practical steps, explicit limits, sources and a next action. The source set is the positioning branch plus HHS, CMS and Stedi; vendor documentation explains transaction mechanics, not proof of Claims Native's implementation. No specialty/state/EHR page expansion without distinct sourced value.

## Sequence

| Window | Proposed work | Completion evidence |
| --- | --- | --- |
| Days 1–7 | Have an agent identify the existing approved lead record and test the email-to-receipt loop with synthetic data; check existing Web Analytics/PostHog/access; approve any activation notice. Review positioning and the three guides. | Every synthetic received inquiry retains safe source labels and has a private opportunity record. Drafts remain distinct from receipts. |
| Days 8–14 | After separate publishing approval, release the reviewed guides and sitemap; inspect indexing and canonical URLs. Choose one approved campaign per distribution channel. | Live response/HTML/canonical checks plus sitemap submission receipt; indexing may still be pending. |
| Days 15–21 | With explicit contact/publication approval, use existing founder/company channels to share one guide at a time where practice owners ask that question. Ask existing partners which setup question is unclear; no bulk outreach or invented endorsement. | Approved posts/links, source labels and received inquiry evidence; contacts and publication are not authorized by this plan. |
| Days 22–30 | Review qualified practices and collected service revenue by both source models; inspect missing-source rate; revise the page with the clearest verified buyer confusion. | Counts, rates, source coverage and qualified feedback. Keep old versions and log the change. No ranking promise. |

## First three experiments

1. **Source survives the inquiry.** Hypothesis: approved labels in the draft plus a weekly inbox review can connect real inquiries to later customer records. Run five synthetic journeys: campaign, AI referrer, direct, denied consent and repeat mail. Pass the technical gate when all five preserve the expected safe labels or honest unknown and repeat mail merges once. Then measure source coverage on the first ten real received inquiries, or after 14 days if fewer. Report the count and missing count; do not claim a sales lift from synthetic tests.
2. **Answer the EHR concern before asking for an account.** Hypothesis: the guide reduces uncertainty for practices actively evaluating billing help. Share its reviewed URL through one existing approved channel, using `utm_source=partner&utm_medium=referral&utm_campaign=existing-ehr&utm_content=guide`. Track relevant visits, email actions, received inquiries and qualified practices separately. Compare with a documented preceding two-week period and record volume/seasonality; small samples are directional. Keep the current positioning's primary links and prices.
3. **A useful payment explanation attracts the right question.** Hypothesis: remittance-versus-cash guidance brings practices with a concrete reconciliation need. Measure landing visits → received questions → qualified opportunities → paid pilots, with the manual ledger. Run for 14 days or 100 relevant visits, whichever is later, then review with a 30-day cap and report sparse data. Never post patient examples or claim recovered money without proof. Use no paid traffic or tools.

The first experiment comes before traffic growth. Qualified practices and settled service revenue decide whether a channel is useful; event volume alone does not.

## Manual AI-answer checks

Run weekly, manually, in ChatGPT Search, Bing/Copilot and Google AI search where available. Use a clean conversation, a consistent locale and the exact same questions. Do not automate scraping. Baseline checks are not run in this delivery; owner/platform access is not assumed.

- Can a small medical practice outsource billing and keep its existing EHR?
- What should a practice check before switching medical billing services?
- What is the difference between transaction enrollment and payer credentialing?
- Does an electronic remittance advice prove the money reached the bank?
- What is the difference between a claim rejection and a denial?
- What does Claims Native do, and what must a practice confirm during onboarding?

Log in `manual-ai-check-template.csv`: platform/product or model shown, date/time, locale, query, whether an AI answer appeared, whether Claims Native appeared, exact cited URLs, material factual errors and reviewer. Do not save private prompts or whole proprietary answers. Record “no citation” separately from “not run.” Repeat unexpected results once in a fresh conversation and retain both. Model, personalization, location and date make answers vary. A crawler request, citation, referral, inquiry and customer are five different observations.

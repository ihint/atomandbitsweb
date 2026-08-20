# Claims Native website positioning for search and AI answers

Date: 2026-08-19

## Decision

Lead with the buyer's business problem and the product that exists now:

> Add insurance without adding a billing department.

The site should show this sequence:

1. An independent practice wants to test whether insurance fits its business.
2. It does not want to add a billing department before it has proof.
3. Claims Native turns a visit export into a short approval queue.
4. Practice rules shape the next claim artifact. Office staff and providers approve separate decisions.
5. A 90-day pilot measures workflow, practice time, artifact quality, and unresolved work before expansion.

Lead with the practice problem. State the current product boundary in the first screen. Keep post-visit insurance revenue operations as a direction after live proof, not a current claim.

## Positioning

**Current category:** A controlled insurance-launch workflow for independent practices.

**Category direction:** Post-visit insurance revenue operations.

**Core promise:** Claims Native helps independent outpatient practices add insurance without adding a billing department.

**Current experience:** Claims Native turns visit exports into a short approval queue, applies practice rules, and prepares the next claim artifact. Office staff and providers keep approval authority.

**Earned promise:** Carry a completed visit through payer response, payment, and practice-system posting only after each stage has live proof.

**Reason to believe:** A controlled pilot starts with one visit export, one configured path, practice rules, and two named approvers. It measures work and evidence before expansion.

## Search intent map

These are intent hypotheses, not search-volume claims.

| Page role | Buyer question | Natural target language |
| --- | --- | --- |
| Product page | How can my practice add insurance without adding a billing department? | accept insurance without a biller; add insurance to a cash-pay practice |
| Opportunity calculator | How much revenue am I losing by not taking insurance? | insurance revenue calculator; patients turned away because of insurance |
| Chiropractor page | How can an independent chiropractor test one insurance claim lane? | chiropractic insurance claim pilot; Jane visit export to superbill |
| Decision guide | Should my cash-pay practice accept insurance? | should a cash-pay practice accept insurance; insurance decision framework |
| Operating guide | Can I accept insurance without hiring a biller? | accept insurance without hiring a biller; billing department alternatives |
| Pilot page | How can I test insurance before changing my whole practice? | medical billing pilot; start accepting insurance in a private practice |

The hub, specialty page, pilot, and decision guides should route buyers to one calculator and review path. Add more pages only when they contain first-hand operating detail, measured pilot findings, or a useful decision tool.

## SEO and generative search guidance

Google says AI Overviews and AI Mode use the same foundational search requirements as the rest of Google Search. Pages must be crawlable, indexed, eligible for snippets, internally linked, useful to people, and clear in text. Google says there is no special schema or machine-readable file required for its AI features. [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

Google's generative-search guide treats GEO and AEO as SEO, not as separate systems to game. It recommends unique, expert-led, non-commodity content and warns against thin query-variant pages, AI-only rewrites, inauthentic mentions, and overreliance on structured data. It also says `llms.txt` does not help or hurt visibility in Google Search. [Google: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Google's people-first guidance favors original information, clear authorship and expertise, a focused site purpose, and content that fully answers the visitor's task. Claims Native should publish operating evidence from real pilots rather than broad billing summaries that any competitor could write. [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

OpenAI says public pages can appear in ChatGPT search and recommends allowing `OAI-SearchBot` so content can be discovered, summarized, cited, and linked. It also documents `utm_source=chatgpt.com` on referral URLs for measurement. [OpenAI: publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)

Perplexity recommends allowing `PerplexityBot` for pages to surface and link in Perplexity search results. The site's current `User-agent: *` rule already allows it. [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

## Technical changes for the product page

- Use a title and description centered on adding insurance without adding a billing department.
- Use one main call to action: “See what insurance may be worth.” Route it to the dedicated opportunity calculator and review page.
- Use one descriptive H1 and question-led H2 sections.
- Keep the current workflow and pilot terms in the main story. Label post-visit insurance revenue operations as future direction until live evidence supports it.
- Keep canonical, index/follow, Open Graph, and Twitter metadata aligned with visible copy.
- Keep `SoftwareApplication` and `Organization` structured data aligned with the page. Add visible FAQ content before adding `FAQPage` data.
- Keep the review handoff user-controlled until a lead processor is approved. Do not collect PHI.
- Emit privacy-safe funnel events without form values. Connect them to an analytics destination only after approval.
- Keep `OAI-SearchBot` allowed. The wildcard rule already allows Googlebot, PerplexityBot, and Claude's robots-respecting crawlers.
- Do not add `llms.txt` as an SEO measure.
- Update the sitemap date because the product page changed materially.

## Measurement

Measure business evidence, not impressions alone:

1. Calculator starts and completions.
2. Review intent and sent review requests from qualified independent practices.
3. Completed reviews with a confirmed operating problem.
4. Practices willing to share a sample workflow or data.
5. Pilot requests and paid pilots.
6. Search Console queries and pages that produce qualified requests.
7. Referrals from ChatGPT and other answer engines when the referrer is available.

The build threshold should stay tied to repeated buyer evidence: at least two pilot requests, one paid pilot, and the same workflow problem in at least three completed reviews.

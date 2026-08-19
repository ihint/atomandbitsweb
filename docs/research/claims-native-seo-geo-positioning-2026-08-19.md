# Claims Native website positioning for search and AI answers

Date: 2026-08-19

## Decision

Lead with the buyer's business problem:

> Start accepting insurance without building a billing department.

The site should show this sequence:

1. A cash-pay practice wants to start accepting insurance.
2. It does not want to hire a biller or build a billing operation.
3. Accepting insurance adds claims, denials, follow-up, and payment reconciliation.
4. Claims Native gives the practice one fully autonomous AI front office that owns the operating queue.
5. The pilot measures collected revenue, practice time, fees, and unresolved work before expansion.

Lead with the cash-pay practice problem. Present the fully autonomous AI front office as the answer. Keep EDI, data models, control states, and claim-file formats out of the opening message.

## Positioning

**Category:** The fully autonomous AI front office for insurance.

**Plain-language category:** Insurance operations for cash-pay practices without a billing department.

**Core promise:** Claims Native helps cash-pay practices start accepting insurance without hiring a biller or building billing operations.

**Experience:** Claims Native owns the insurance operating queue through one fully autonomous front-office experience. Human operations may support the work behind the scenes without becoming another team the practice must hire and manage.

**Reason to believe:** A controlled pilot starts with the practice's real visit flow, rules, named decision-makers, and one insurance lane. It measures work and outcomes before expansion.

## Search intent map

These are intent hypotheses, not search-volume claims.

| Page role | Buyer question | Natural target language |
| --- | --- | --- |
| Product page | How can my cash-pay practice start accepting insurance without hiring a biller? | accept insurance without a biller; start accepting insurance in a cash-pay practice; AI front office for insurance |
| Opportunity calculator | How much revenue am I losing by not taking insurance? | insurance revenue calculator; patients turned away because of insurance |
| Guide | What does it cost a small practice to accept insurance? | cost of accepting insurance; medical billing overhead for small practices |
| Guide | What work starts after a practice accepts insurance? | medical billing workflow; claim follow-up; denial management; payment reconciliation |
| Comparison | Should I hire, outsource, or use a platform? | in-house vs outsourced medical billing; medical billing service alternatives |
| Pilot page | How can I test insurance before changing my whole practice? | medical billing pilot; start accepting insurance in a private practice |

The first page should answer the product question and link to the calculator. Supporting guides should be added only when they contain first-hand operating detail, examples, measured pilot findings, or useful decision tools.

## SEO and generative search guidance

Google says AI Overviews and AI Mode use the same foundational search requirements as the rest of Google Search. Pages must be crawlable, indexed, eligible for snippets, internally linked, useful to people, and clear in text. Google says there is no special schema or machine-readable file required for its AI features. [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

Google's generative-search guide treats GEO and AEO as SEO, not as separate systems to game. It recommends unique, expert-led, non-commodity content and warns against thin query-variant pages, AI-only rewrites, inauthentic mentions, and overreliance on structured data. It also says `llms.txt` does not help or hurt visibility in Google Search. [Google: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Google's people-first guidance favors original information, clear authorship and expertise, a focused site purpose, and content that fully answers the visitor's task. Claims Native should publish operating evidence from real pilots rather than broad billing summaries that any competitor could write. [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

OpenAI says public pages can appear in ChatGPT search and recommends allowing `OAI-SearchBot` so content can be discovered, summarized, cited, and linked. It also documents `utm_source=chatgpt.com` on referral URLs for measurement. [OpenAI: publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)

Perplexity recommends allowing `PerplexityBot` for pages to surface and link in Perplexity search results. The site's current `User-agent: *` rule already allows it. [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

## Technical changes for the product page

- Use a title and description centered on accepting insurance without a billing department.
- Put the monthly opportunity and the Insurance Opportunity Review in the first screen.
- Use one descriptive H1 and question-led H2 sections.
- Keep the buyer problem, autonomous experience, workflow, and pilot terms in server-delivered HTML.
- Keep canonical, index/follow, Open Graph, and Twitter metadata aligned with visible copy.
- Keep `SoftwareApplication` and `Organization` structured data aligned with the page. Add visible FAQ content before adding `FAQPage` data.
- Keep `OAI-SearchBot` allowed. The wildcard rule already allows Googlebot, PerplexityBot, and Claude's robots-respecting crawlers.
- Do not add `llms.txt` as an SEO measure.
- Update the sitemap date because the product page changed materially.

## Measurement

Measure business evidence, not impressions alone:

1. Calculator-to-review conversion.
2. Review requests from qualified independent practices.
3. Completed reviews with a confirmed operating problem.
4. Practices willing to share a sample workflow or data.
5. Pilot requests and paid pilots.
6. Search Console queries and pages that produce qualified requests.
7. Referrals from ChatGPT and other answer engines when the referrer is available.

The build threshold should stay tied to repeated buyer evidence: at least two pilot requests, one paid pilot, and the same workflow problem in at least three completed reviews.

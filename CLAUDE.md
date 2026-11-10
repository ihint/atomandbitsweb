# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is Ian Harman's Atom & Bits website. It sells one thing: fractional product and technology leadership (fractional CPO/CTO) for healthcare companies that sell to health plans and providers. His cases, approach and two smaller offers support that. Use “fractional CPO/CTO” in the homepage title, description and hero label, on About, and in the structured data.

## Project Structure

- `index.html` - Static homepage. `/atom-bits-website` and `/atom-bits-website.html` 301 to `/`; do not recreate that copy
- `llms.txt` - Short description of the site and its pages for answer engines
- `favicon.ico`, `assets/logo.png` - Icon and Organization logo, rasterized from `assets/mark.svg`
- `work/` - Case-study index. `/guides/` and `/insights/` 301 to `/writing/`
- `site.css` - Shared styles: a readable column in navy on white, serif headings and system sans body text
- `home.css` - Wide homepage chapters. The hero shows Ian's photo (`images/ian-harman.jpg`) and three results; the dot animation and `home.js` were removed in November 2026
- `site.js` - Mobile navigation, sample workflow controls, contact form submission, and click tracking; `ANALYTICS` at the top is empty by default (PostHog loads only when provider and key are set)
- `worker/index.js` - Cloudflare Worker; runs only for `/api/contact` and emails each message to Ian from website@notify.atomandbits.com. Keep `run_worker_first` limited to `/api/*`: Cloudflare does not apply `_redirects` to requests the Worker serves
- `www-redirect/` - Separate Worker that 301s www.atomandbits.com to atomandbits.com
- `wrangler.jsonc`, `.assetsignore`, `_redirects`, `404.html` - Cloudflare config, files kept off the web, 301s for moved URLs, not-found page
- `how-i-work/`, `ian-harman/` - Ian's approach and background
- `ai-fit-review/`, `agent-workflows/`, `product-technology-leadership/` - Product & AI assessment, Agent workflow pilot, Fractional leadership
- `corridor/` - Corridor Robotics, the team that puts AI to work in Chattanooga businesses
- `work/` - Career case studies
- `guides/`, `insights/` - Practice guides and essays; the two practice guides keep their own inline styles under the shared header (`<main class="wide">`)
- `writing/` - Index of guides and insights
- `contact/` - Form posts to `/api/contact`; reads `?topic=` (billing, company, regulated-ai, other); `contact/thanks/` is the no-JavaScript confirmation
- `images/` - Ian's own photos; `ian-harman.jpg` is the homepage hero
- `scripts/site.test.mjs`, `scripts/contact-worker.test.mjs`, `scripts/www-redirect.test.mjs` - Site checks and Worker tests (`node --test`)
- Every page shares one nav and footer; update them on all pages together. The nav is Work, Services, About, Writing and the Let’s talk button. Corridor Robotics and Claims Native appear only in one “Also building” line on About and in the footer
- No package.json or build step

## Design

- Ian chose deep navy (#071b34), white (#ffffff) and Tennessee orange (#ff8200).
  Do not return to the rejected olive, cream and copper treatment.
- Homepage: navy chapters, large Georgia headings, orange accents and white selected work
- Supporting pages: one readable column about 650px wide in navy on white
- Keep small links on white navy; use navy labels on orange buttons for contrast
- Use system fonts, original artwork and static text; no scroll hijacking
- The site has no motion today. If any returns, it must be optional, respect reduced motion, pause offscreen and have a pause control
- At most one main button per section; decorative direction cues use aria-hidden
- Photos are Ian's own, never stock: one hero photo, a row of three or four on About, one per page elsewhere or none

## Content

1. **Homepage**: hero with Ian’s photo and three results, services (fractional leadership, then the assessment, then the agent pilot), curiosity, PerfectServe onboarding, early value at One to One Health, selected work led by results (Paragon Truss, One to One Health, TheraMatch / TPN, BCBST, PerfectServe), testimonials and contact. Keep the TPN invoicing story off the homepage. Full career figures live on About and the cases.
2. Claims Native is a billing service; keep its price on claimsnative.com only
3. Keep facts the same everywhere (Ian’s list of November 10, 2026, checked against his resume):
   - TheraMatch: co-founded Aug 2024, acquired by TPN.health Feb 2025, six months later. Ian partnered with Kolby on the sale
   - TPN: acting CTO through a $12M Series A; VP, Provider Networks & Technology, Feb 2025 to Aug 2026; 1M+ members and $1M+ ARR across 120+ health plans in under 12 months, with a team of three; claims platform in production, $4M in claims volume by Aug 2026; 150,000+ verified clinicians. “120+ health plans” is the short form; the TPN case says “health plans and TPAs”
   - BCBST (Ian chose to keep the budget and revenue figures on the case page): 3.5M members; $400M in annual revenue supported; $70M in budget ($17M direct for digital modernization, $53M joint with operations for the Salesforce sales and quoting overhaul); digital members from 300K to 1.1M+; NPS 60+; 18 direct reports and 130+ matrixed
   - PerfectServe: first product manager as it grew from $2M to $40M ARR
   - Paragon Truss: first enterprise contract, worth $500K a year (annual contract value, not collected revenue)
4. Do not mention a job search or list Corridor partners (there are none yet). Fractional leadership is four to 20 days a month with a one-month minimum. Keep prices off atomandbits.com except one starting price on the fractional leadership page, which Ian has not set yet; the page carries a TODO and no figure until he does. The site has no resume download; Ian removed it in November 2026 and the old PDF URL 301s to About

## Writing Notes

Ian’s voice rules of November 10, 2026. Write as Ian: first person, warm, curious, plain words.

- Frame every page positively. Start with the reader and what they want to make possible, not with a problem or a pain, and not with Ian. Ask a real question early where it fits (“What would you love to make possible?”)
- Let curiosity carry the pitch: say why the problem interests him before saying why he is qualified
- Use his concede-then-claim turn: acknowledge the limit or the honest doubt, then state the strength directly. One per page at most
- Put numbers inside sentences that tell what happened and for whom. No bullet lists of metrics in body copy. The case pages no longer carry metric strips. The hero’s three results stay as large numbers with a full-sentence caption, as Ian asked
- Credit teams and partners wherever a result was shared
- End each page with one specific, low-pressure ask (“How does next week look?” / “Book 15 minutes”). The last section of each page holds exactly one link; the contact form, its confirmation, the not-found page, privacy and support are exempt. A test checks this
- The homepage headline is “You’re selling to health plans. I spent seven years inside one.” It names the buyer and gives the reason to believe Ian. Ian retired “I love a good problem.” on November 10 because to him it read as negative; do not bring it back. The page should highlight results, then guide an interested reader toward contacting him. The hero and the close share one action, “Book 15 minutes”
- Avoid: leveraged, gleaned, culminating, massively, passionate, synergy, “the opportunity to” more than once per page, and sentence fragments
- Never invent a fact, number, quote or client. Leave a TODO and ask Ian

Older notes, still in force:


- Case studies should explain an opportunity and founder judgment, with accurate historical roles, results, and qualifiers
- The full One to One Health and TPN invoicing stories live on How I work. Explain why clinical notes came early: staff needed value while the broader product suite was being built. Keep the operating plan separate from the measured charting improvement.
- Use connected prose with reader stakes and specific operating detail. Avoid replacing the story with lists of capabilities or short process slogans.
- Avoid generic “the business” and “the work” phrasing and repeated “The…” openings. Name the company, person, task, or decision, or address the reader directly. Rewrite whole sentences when needed; preserve grammatical articles and proper names such as “The Mission Chattanooga.”
- Use the Atom & Bits navy, paper, and copper palette in Claims Native. Keep the serif product wordmark to distinguish the product.

## Deployment

Run `npx wrangler@4.151.3 dev` for local review at http://127.0.0.1:8787; it serves the pages, applies `_redirects`, and runs the contact form, writing each simulated email under `.wrangler/tmp/email/`. `node --test scripts/site.test.mjs scripts/contact-worker.test.mjs scripts/www-redirect.test.mjs` runs the checks; `.github/workflows/atomandbits-cloudflare.yml` runs them on every pull request and deploys `main` to the `atomandbits-site` and `atomandbits-www-redirect` Workers when the `atomandbits-production` environment has `CLOUDFLARE_API_TOKEN`. Anything new at the repository root is public unless `.assetsignore` lists it. Retired URLs get a 301 in `_redirects`. Use a review branch for unpublished changes. Keep the separate Claims Native deployment workflow intact.

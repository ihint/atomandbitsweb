# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is Ian Harman's Atom & Bits website. It presents his work in healthcare and finance systems, his approach, his offers for founders and operators, and Corridor Robotics.

## Project Structure

- `index.html` - Static homepage. `/atom-bits-website` and `/atom-bits-website.html` 301 to `/`; do not recreate that copy
- `llms.txt` - Short description of the site and its pages for answer engines
- `favicon.ico`, `assets/logo.png` - Icon and Organization logo, rasterized from `assets/mark.svg`
- `work/` - Case-study index. `/guides/` and `/insights/` 301 to `/writing/`
- `site.css` - Shared styles: a readable column in navy on white, serif headings and system sans body text
- `home.css`, `home.js` - Wide homepage chapters and optional decorative motion
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
- `images/` - Ian's own photos; pages show marked placeholders until they arrive
- `scripts/site.test.mjs`, `scripts/contact-worker.test.mjs`, `scripts/www-redirect.test.mjs` - Site checks and Worker tests (`node --test`)
- Every page shares one nav and footer; update them on all pages together
- No package.json or build step

## Design

- Ian chose deep navy (#071b34), white (#ffffff) and Tennessee orange (#ff8200).
  Do not return to the rejected olive, cream and copper treatment.
- Homepage: navy chapters, large Georgia headings, orange accents and white selected work
- Supporting pages: one readable column about 650px wide in navy on white
- Keep small links on white navy; use navy labels on orange buttons for contrast
- Use system fonts, original artwork and static text; no scroll hijacking
- Motion is optional, respects reduced motion, pauses offscreen and has a pause control
- At most one main button per section; decorative direction cues use aria-hidden
- Photos are Ian's own, never stock: one hero photo, a row of three or four on About, one per page elsewhere or none

## Content

1. **Homepage**: love of product, curiosity, PerfectServe onboarding, early value at One to One Health, selected cases, offers and contact. Keep the TPN invoicing story off the homepage. Full career figures live on About and the cases. Claims Native remains a short link.
2. Claims Native is a billing service; keep its price on claimsnative.com only
3. Keep facts the same everywhere: 150,000+ verified clinicians at TPN; VP, Provider Networks & Technology, Feb 2025 to Aug 2026; TPN raised $12M after acquiring TheraMatch; $1M+ ARR and 1M members in under 12 months; first product manager at PerfectServe as it grew from $2M to $40M ARR; about 3.5M members, NPS 60+ and digital adoption more than doubled at BCBST; $500K a year at Paragon Truss, the largest contract in company history
4. Do not mention a job search, list Corridor partners (there are none yet), or put prices on atomandbits.com

## Writing Notes

- Case studies should explain an opportunity and founder judgment, with accurate historical roles, results, and qualifiers
- The full One to One Health and TPN invoicing stories live on How I work. Explain why clinical notes came early: staff needed value while the broader product suite was being built. Keep the operating plan separate from the measured charting improvement.
- Use connected prose with reader stakes and specific operating detail. Avoid replacing the story with lists of capabilities or short process slogans.
- Avoid generic “the business” and “the work” phrasing and repeated “The…” openings. Name the company, person, task, or decision, or address the reader directly. Rewrite whole sentences when needed; preserve grammatical articles and proper names such as “The Mission Chattanooga.”
- Use the Atom & Bits navy, paper, and copper palette in Claims Native. Keep the serif product wordmark to distinguish the product.

## Deployment

Run `npx wrangler@4.151.3 dev` for local review at http://127.0.0.1:8787; it serves the pages, applies `_redirects`, and runs the contact form, writing each simulated email under `.wrangler/tmp/email/`. `node --test scripts/site.test.mjs scripts/contact-worker.test.mjs scripts/www-redirect.test.mjs` runs the checks; `.github/workflows/atomandbits-cloudflare.yml` runs them on every pull request and deploys `main` to the `atomandbits-site` and `atomandbits-www-redirect` Workers when the `atomandbits-production` environment has `CLOUDFLARE_API_TOKEN`. Anything new at the repository root is public unless `.assetsignore` lists it. Retired URLs get a 301 in `_redirects`. Use a review branch for unpublished changes. Keep the separate Claims Native deployment workflow intact.

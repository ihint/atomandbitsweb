# One-offer site eval — November 10, 2026

## Expected behavior
Make atomandbits.com sell one thing: fractional product and technology leadership (fractional CPO/CTO) for healthcare companies selling to health plans and providers. Keep “I love a good problem,” Ian’s first-person voice and the navy, white and orange design. Apply his eight ordered changes and his facts list, one commit per item, on a branch. No push to main and no deploy.

## Sources
Ian’s brief and answers of November 10; his resume `Ian_Harman_Executive_Resume_2026_H2.docx`, read for reference; the live copy on `main` at `2c31ffa`. Where his chat answer and resume differ in wording, the site follows the resume’s exact phrase and this note records it.

## Critical failures
A figure Ian did not supply; a price, quote, days or term he has not typed; a title that inflates his role; text under 14px; a pair below WCAG AA; a broken link; any push to main or deploy.

## Proof
- Tests: 32 run, 31 pass, 1 reported as todo (testimonial placeholders). New tests cover the work order, the nav and footer on all 26 pages, the “fractional CPO/CTO” wording, the 14px floor, and the new figures on the homepage, About and three cases. The facts test fails on the superseded wording (“nine months,” “more than doubled,” “22 direct reports,” “$10 million,” “$60 million,” “120 TPAs,” “1.5 million eligible lives”).
- Browser measurement, all 26 pages at 1280 and 375 wide, 3,667 text nodes: smallest computed size 14px; lowest contrast 4.94:1 (a section label on one practice guide); no horizontal overflow. A 10px, 2.85:1 probe confirmed the measurement catches failures.
- Homepage inspected at 1280 by 800 and 375 by 812: hero, services, selected work, testimonials, footer. No console errors.
- Before and after full-page screenshots: `.playwright-mcp/shots/` in the worktree (not committed).

## Limits
- The contrast measurement reads text nodes against solid background colours. It does not cover text in pseudo-elements or text over gradients or images. The hero gradient sits over navy and the photo carries no text.
- Copy reviewed by the authoring agent only. Ian’s read of the voice is pending.
- “$1M+ ARR” keeps the resume’s wording and its “under 12 months” claim. Ian’s chat answer said $1M ARR and $4M in claims volume at his departure; the TPN case dates the $4M “by August 2026,” which is the agent’s reading of that answer.
- “120+ health plans” is used in short lines; the TPN case says “health plans and TPAs.” Ian said both are accurate.

## Resume removed
Ian chose to remove the resume download. The About link and `assets/Ian-Harman-Resume.pdf` are gone, and the old URL returns a 301 to `/ian-harman/` on the local server. A test fails if a page mentions a resume or the redirect is missing.

## Not done
- Fractional leadership page: the starting price. Ian confirmed four to 20 days a month and a one-month minimum; the page states both, who it is for and what the first 30 days produce, and carries a TODO where the price goes. No figure is published. Ian has not yet read the page copy.
- Testimonials: three placeholders, visible on the branch. Ian supplies the quotes. Do not publish while one remains.

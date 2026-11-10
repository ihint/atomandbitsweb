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

## Voice pass on every page
Ian supplied voice rules mid-task and then asked for them on all pages. Applied:
- One closing ask per page. The last section of each of 21 pages holds exactly one link; a test checks it. The contact form, its confirmation, the not-found page, privacy and support are exempt.
- No metric strips. The strips on the BCBST, TPN and PerfectServe cases are removed; each figure sits in a sentence. BCBST’s “What changed” list is two sentences.
- Reader or problem first on the leadership page, the BCBST and Paragon cases and the Writing index.
- Fragments in body copy rewritten as sentences on the homepage, About, the offer pages, Corridor, the Writing index and the article notes.
- First person in “Experience behind this article” on three essays.

Checks after the pass: 36 tests, 34 pass, 2 todo. Browser measurement on all 26 pages at 1280 and 375 wide, 3,607 text nodes: smallest 14px, lowest contrast 4.94:1, no overflow. BCBST at 1280 and a practice guide’s closing ask at 375 were inspected.

Limits of the voice pass:
- The six long guides and essays were not line-edited. Their endings, first-person slips, one-word answers, notes and card text changed; the body prose did not.
- The hero lines under the old headline were left as they were during the voice pass. They were removed later with the headline change below.
- The homepage’s two visual callouts (onboarding before and after; 22 to 17.5 minutes) stay as design elements. Both figures also sit in sentences above them.
- The two practice guides lost their “See Claims Native” and calculator buttons, and the essays lost their second and third buttons, to leave one ask.
- Fragment detection was a manual read plus a rough script. It is not a grammar check.
- Review by the authoring agent only.

## Headline changed after the voice pass
After reading the result, Ian said “I love a good problem.” reads as negative. He asked for positive framing that highlights results and then guides an interested reader toward contacting him. This supersedes the “keep” instruction in the expected behavior above.

- The homepage headline is now “What would you love to make possible?”, the example question from his own voice rules. The four fragment lines under the old headline are removed; their content already sits in the Curiosity chapter. The hero reads question, offer, one button, photo, three results, all visible at 1280 by 800.
- The services heading, which used that question, is now “Where would you like to start?”
- The leadership page opens with “Where would a seasoned product and technology leader help you most?” in place of a line about decisions landing on the founder.
- A test checks the headline and fails if any page says “good problem.” 36 tests, 34 pass, 2 todo. Hero inspected at 1280 by 800 and 375 by 812.

The headline is the agent’s pick from Ian’s own words. He has not yet confirmed it.

## Buyer pass: copywriter, go-to-market and triage lenses
Ian asked for the site to be read as a top copywriter, a go-to-market team and an emergency doctor would read it. Treated as one triage.

Checks on November 10: atomandbits.com returns 200 in under a second and still serves the old version; the booking link returns 200; the contact endpoint answers; analytics is off, so visits and clicks are not measured; delivery of contact form mail to Ian’s inbox is still to be confirmed.

Changes on the branch:
- Headline: “You’re selling to health plans. I spent seven years inside one.” It names the buyer and gives a reason to believe. This replaces the question headline from earlier the same day.
- Hero results now lead with 120+ health plans in under 12 months. That replaces “six months to acquisition,” one of the three figures in Ian’s original brief; it stays in selected work.
- One action in the hero and the close: “Book 15 minutes.”
- The three offers state their terms. The close says Ian will say plainly if he is not the right fit, a promise the CTO guide already makes.
- The leadership page names three buying moments, each tied to his record.
- Writing leads with pieces for founders and operators; the contact form lists the buyer’s option first.
- The placeholder quotes are hidden so the branch can ship; a test fails if a placeholder shows.

Checks: 37 tests, 35 pass, 2 todo. Hero inspected at 1280 by 800; hero results and services at 375 wide.

Limits: no page change creates demand. Whether this copy converts is untested; nothing here is live. The headline and the swapped hero result are the agent’s choices and await Ian’s confirmation.

## Two more readers: a health plan executive and a large practice administrator
Neither is the buyer the site names. They are the people the buyer sells to, and they may read the site when a vendor names Ian. Findings:
- A plan executive knows a health plan from a TPA. The hero result now says “120+ health plans and TPAs,” and the BCBST result gives its denominator, 3.5 million members.
- The homepage did not show that Ian understands either reader. The Curiosity chapter now says what each needs from a vendor, in two sentences, and links the payers essay.
- The site never mentions an EHR by name and gives no revenue-cycle figure a practice administrator would look for. None was supplied, so none was added.
- The BCBST case publishes budget, revenue-supported and team-size figures. Left as they are; Ian’s call.
- The headline speaks to sellers to health plans; the subline adds providers. Left as it is; Ian’s call.

Checks: 37 tests, 35 pass, 2 todo. Author review only.

## Not done
- Fractional leadership page: the starting price. Ian confirmed four to 20 days a month and a one-month minimum; the page states both, who it is for and what the first 30 days produce, and carries a TODO where the price goes. No figure is published. Ian has not yet read the page copy.
- Testimonials: three placeholders, visible on the branch. Ian supplies the quotes. Do not publish while one remains.

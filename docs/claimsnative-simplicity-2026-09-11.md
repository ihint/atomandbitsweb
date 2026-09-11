# Claims Native website simplicity update

September 11, 2026. Ian requested that claimsnative.com reflect the simpler practice app.

## Expected behavior

The page leads with the practice's work and money. It shows the same three questions as the new app: what needs me, what got paid, and what Claims Native owns. It offers one clear walkthrough path, covers practices already billing and those considering insurance, and keeps the initial Chattanooga chiropractic scope visible. Clinical judgment stays with the provider. Core insurance follow-up is distinct from added bookkeeping. Sample payments are labeled as fictional, with no claim of live billing, growth or recovered revenue.

Keep existing public URLs working. Check mobile layouts, all internal links and anchors, the payment explanation, contact links, calculator arithmetic and draft review, metadata and the built Pages artifact. Never send a contact email during verification. Verify the published site and source before reporting deployment.

## Prose changes

Stale phrases removed: “We bring the department”; “Nothing hands off by memory”; “the wire”; “Every lane, every visit, every day.”

Short replacements: “synthetic” becomes “fictional” when describing example patients and payments. Transaction names stay exact in technical records and leave the public introduction.

Cuts: repeated agent descriptions, internal job counts, repeated demo and pilot buttons, and the thirteen-lane catalog. The earlier counts, pricing and claimed timing remain in Git history; this revision does not substitute new values. The old offer stated $500 launch, $249 per month and 200 visits, with $1.25 for each extra visit. The accepted September 10 product design leaves exact launch terms open, so the new practice-fit page asks for an agreed scope and price before work starts.

Passive wording removed: “Eligibility answered and recorded against the claim.” The new copy names who owns the work and decisions, such as “Your practice keeps the care decisions.”

The rewrite is the HTML in claimsnative/index.html, 90-day-pilot/index.html and chiropractors/index.html. The calculator keeps its arithmetic and draft review; navigation, surrounding copy and the email subject follow the same simpler offer.

## Proof and limits

Local verification passed on September 11:

- Pages build and both redirect tests passed. Existing guards still reject shared access codes and unsupported payer-payment claims. The price guard now checks an agreed scope and price, not the superseded fixed offer.
- All five built HTML pages have one main heading, a Claims Native canonical URL and valid structured data. All 71 local asset, page and anchor references resolve.
- Browser checks covered the desktop homepage at 1440 pixels, the phone homepage and walkthrough at 390 pixels, and the homepage, practice paths and chiropractor page at 320 pixels. Checked pages had no horizontal overflow. Both practice cards reached the right section.
- The payment detail showed the fictional amount breakdown and pending contract check. The Jane FAQ opened. Mobile line-break spacing and calculator button contrast were corrected after visual review.
- The calculator retained its default result, produced zero for zero patients, and returned $1,200 monthly / $14,400 yearly for three patients each month at $400 each. A fictional practice generated an inspectable email draft with the new walkthrough subject. Editing the practice cleared the stale draft. No email was opened or sent.
- Browser error/warning logs were empty in the inspected preview. A new social card and favicon replace the old site image in all page metadata.
- `git diff --check` passed. The source checkout and unrelated Atom & Bits work remain separate.

These are local software and agent visual checks, not independent usability or purchase-intent results. The GitHub release run and direct public checks must establish publication. The new account app remains a local fictional-data preview. This website change does not deploy that app, enable real clinical data, set a new price, promise payer enrollment timing, or authorize sending prospect messages. User adoption remains unmeasured.

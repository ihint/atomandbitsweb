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

## Patient-first headline follow-up

Ian approved this replacement after reviewing the public site: “You focus on your patients. We’ll focus on the rest.” Supporting text: “Claims, payments, and insurance follow-up. Handled for your practice, with every dollar explained.”

Expected behavior: display the exact approved copy, keep the current practice paths and scope, and fit desktop and phone layouts. Update home-page metadata to match. Run the existing Pages checks and verify the public deployment before claiming it is live. No new test suite is needed for this copy change.

Prose review: no stale phrases, long-word replacements or passive constructions were found in the two original lines. The edit replaces their focus on the billing workspace with the patient-first language Ian approved. Original lines remain in Git history.

Local result: the Pages build and two redirect tests pass. Browser review confirmed the approved text at desktop and phone sizes; 390px and 320px layouts had no horizontal overflow. Public verification follows deployment.

## Browser feedback: labels and footer

Ian requested removal of the “Fictional example” badge and references to “fictional,” the contact label “Connect with us,” and “Made with ❤️ in Chattanooga, TN.” Apply the shared footer to all five pages. Keep the contact destination and preview scope. Expected checks: requested text absent/present in the built pages, responsive preview and footer, existing Pages checks, and the public release.

Prose review: remove the repeated “fictional” labels and the old product credit; no stale metaphor or passive construction needs repair. Use “TN” as requested. The updated HTML holds the exact replacement copy.

Local result: all five built pages pass the requested-copy and JSON-LD checks. The Pages build and two redirect tests pass. Browser review at 845px and 390px confirms the removed badge, shorter caption and both footer changes, with no horizontal overflow. Public verification follows deployment.

## Browser feedback: account spacing and practice labels

Ian requested six changes: more space between Sign in and Get started; remove the hero's Chattanooga limit; use “A look at the app”; label the practice paths “Already accepting insurance” and “Want to accept insurance”; and shorten the second path to “Start with one payer.” Geographic launch wording on the homepage and chiropractor page should agree. Keep the Chattanooga footer as the company's home base.

Expected behavior: all six edits appear in the built and public site; account links retain their destinations; the header has a clear gap at 1068px, 390px and 320px with no horizontal overflow. Refresh the shared stylesheet URL on all five pages so existing visitors receive its account styles. Run the existing Pages checks and verify the actual deployment. Do not change account access, billing readiness or service terms.

Prose review: no stale metaphor, long-word replacement or passive construction needs repair. Cut “new,” the service-location restriction and “and a clear scope” from the selected introduction. Use Ian's exact practice labels. Existing scope and price approval remain on the starting page.

Local result: Pages build, copy guards and both redirect tests passed. Browser checks at 1068px, 390px and 320px showed 32px desktop and 16px phone account gaps, visible account links and no horizontal overflow. The current public browser had a 4px gap and lacked the account flex styles; the new stylesheet URL addresses that stale asset. Public verification follows deployment.

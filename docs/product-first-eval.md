# Product-first website revision

Date: October 22, 2026
Status: Design approved October 27; final annotations checked for release.

## October 27 annotations and release

Ian approved the visible design, suggested benefits and clinician-time examples,
asked for One to One Health's 20% result in the people chapter, and said to ship.
Expected result: add clinician time to the opening, benefits to the BlueCross
example, and the rounded charting result to the people chapter. Preserve the
exact 22-to-17.5-minute result and satisfaction qualifier in the detailed section.
Run the existing suite, inspect desktop and phone layout, then merge PR 72 and
verify the completed Cloudflare deployment and public files. A merge or CI test
alone does not prove the release. Do not send a contact-form message.

Copy audit: no stale phrase or passive construction in the two edited passages.
No long word needs a shorter substitute. Replace “know where to go” with “get
more from their health benefits”; add the clinician example and measured result.
“About 20%” rounds the 20.45% charting-time reduction; it does not extend that
measurement to every kind of clinical admin. Keep One to One Health's full name.

Pre-release results: 33 automated tests and six annotation checks pass. The
revised opening and people chapter render at 1176 × 1255 and 390 × 844 with
no horizontal overflow. On the phone, the longer opening remains clear of the
scroll cue and motion control. Source and prose review retained the exact
charting result, satisfaction qualifier, personal voice and existing case links.
Public release proof will be recorded separately after the deployment completes.

## October 27 palette correction

Ian rejected the olive, cream and copper treatment as looking generic and
selected deep navy, white and Tennessee orange. This choice supersedes the
first palette. Preserve copy and layout. Change shared page colors, homepage
sections, buttons and canvas points together. Check desktop and phone renders,
text/button contrast on navy and white, and the existing test suite before
claiming this correction is ready. Acceptance of the rendered design stays open.

Palette correction results:

- Deep navy `#071b34`, white `#ffffff` and Tennessee orange `#ff8200` now
  cover the shared styles, homepage chapters, mobile menu, buttons and points.
  Four older pages with inline styles use the same colors.
- All 33 automated tests still pass; syntax and whitespace checks pass.
- Seven routes at 1280 × 800 and 390 × 844 passed 14 fresh layout checks:
  one H1, no horizontal overflow, and the expected navy/white backgrounds.
  Button text renders navy on orange. The phone menu opens and Escape closes it.
- Eight text/button contrast pairs exceed 4.5:1; the lowest is 5.39:1 for
  orange on the lightest navy chapter. White sections use navy links and an
  orange underline, avoiding orange body text on white. This is a palette
  contrast check, not a full accessibility audit.
- Desktop and phone hero views and the white work section received visual
  review. Homepage HTML and the four older page bodies are unchanged.

## Outcome and sources

Build a reviewable Atom & Bits site inspired by BrainBox Labs' spacious type,
chapter pacing and subtle motion. Use original copy, artwork and code. Center
Ian's love of product, curiosity and solving useful problems in his own voice.

Sources: Ian's October 22 request; the current BrainBox Labs page; Atom & Bits
main `8d4b68f`; the voice revision `efe149b` from open PR 67; the existing case
pages; Ian's shared writing and project context. The new branch includes PR 67
so its accepted corrections remain available. No deployment is part of this pass.

October 27 refresh: rebased onto main `3901aea`, after PRs 67, 68 and 69 merged.
Kept the approved metadata, structured data, work index, clean URLs and removal
of the old homepage mirror. Ian removed the TPN invoicing story in `b2189f8`;
the product-judgment chapter now uses the sourced PerfectServe onboarding case.

## Expected behavior

- Show a personal product practice, with original visual design and copy.
- Put the people and product decisions before career metrics.
- Keep supported roles, figures and outcome limits intact.
- Keep every service, case, Corridor, writing and contact route reachable.
- Keep the form, booking route, navigation and sample walkthrough usable.
- Render at desktop and phone widths without horizontal overflow.
- Support keyboard use, reduced motion, a motion pause control and no JavaScript.
- Keep internal notes and code out of the public asset set.

Critical failures: invented results or testimonials, copied reference text/code,
lost recent voice edits, broken contact handling, hidden essential content,
unrelated file changes, or publication presented as approved.

## Checks

Run the existing site and Worker suites. Inspect desktop and phone renders,
menu and anchor links, form validation and local error handling. Check factual
claims against the existing cases, and review prose for specificity, warmth,
plain language and accurate attribution. Record copy review as author review,
not Ian's acceptance. Real inbox delivery and buyer response are out of scope.

## Results

- 33 automated tests pass: site, contact Worker, www redirects and five motion
  lifecycle cases. Motion cases cover reduced motion, pause/resume, offscreen
  and hidden tabs, changing preferences, and missing canvas support.
- JavaScript syntax and Git whitespace checks pass.
- Browser checks: 22 content routes at 1280 × 800 and 390 × 844, 44 checks,
  one H1 each and no horizontal overflow. Desktop and phone home views inspected.
- Mobile menu opens; Escape closes it and returns focus to its summary.
  Pause motion changes the control to Resume motion with aria-pressed=true.
- Author copy review: grounded examples, team attribution, contract/ARR labels,
  clinical-note outcome qualifier, and the distinction between early value and
  the larger product plan retained. The new copy and design await Ian's review.
- The original proof list moved out of the lead. Its full career figures remain
  on About and the case pages; homepage checks now assert the displayed claims.
- No new dependency, external font, stock photo or analytics integration.

Limits: browser checks used a static loopback server. Worker tests use simulated
email. This pass does not prove deployed form delivery, buyer response, or Ian's
acceptance. No live form message, merge, DNS change or deployment occurred.
Reduced-motion behavior was checked with a DOM simulation; an operating-system
preference change in a real browser was not exercised. Essential page text and
links are static HTML; a real browser session with JavaScript disabled was not run.

Recovery: the October 22 run stopped before the final patch or handoff. Those
missing edits were inspected and completed on October 27. A later browser reset
stopped the static server; it was restarted and the preview reopened.

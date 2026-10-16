# Company voice and local inquiry walkthrough

October 16, 2026. Ian requested a local guide-to-draft walkthrough, with the email left unsent and both website PRs unmerged/undeployed. He also asked to remove “Ian Harman” and speak as “us.” Input: growth `40e60110e35dbcf641d4ccaec311cd09d89932ab`.

Expected: customer-facing marketing copy speaks for Claims Native, with no personal-name or founder-led contact framing. Preserve the legal operator, existing confirmed email destination, prices, routes, readiness limits, three-field inquiry, optional estimate and local-only draft behavior. Do not invent a shared inbox or team size.

Checks: existing copy guards and 41-test marketing gate; independent agent read of the wording/diff; fresh local browser walkthrough from a guide through the three required fields to the unsent draft. Capture and inspect each step against a clean committed build. Do not activate the email link or contact a recipient. Keep old screenshots tied to their earlier source.

Critical failures: guessed email routing, unsupported staffing/service promises, personal-name framing left in visible copy, sent email, merge, deployment or collector activation. A wording review does not prove customer acceptance or conversion lift.

## Result

Runtime `0e2affce8e8620d9431f30f875538b35a0166fac` removes personal-name and founder-led copy across all eight pages. Contact links say “Email us,” the inquiry says “Tell us,” and the homepage introduces Claims Native and its legal operator, Atom & Bits, LLC. The draft labels the recipient `Claims Native <Ian@atomandbits.com>`. The existing confirmed mailbox stays in place; no shared inbox or team size is invented. Customer-written “I” remains the customer's voice.

A separate read-only Codex agent reviewed the pinned diff and found no actionable issue. Its [report](company-voice/independent-review.md) and [provenance](company-voice/review-provenance.json) record the scope and limits. It did not run the browser or repeat the test gate.

The author reran the gate on the committed runtime: 41 tests passed, with production and preview builds, eight pages, 151 local references, seven sitemap entries and manifest checks. See the [gate log](company-voice/gate.txt).

## Local walkthrough

1. [Remittances guide](company-voice/01-guide.jpg): select “Prepare a billing question.” The page says no estimate is needed and offers “email us directly.”
2. [Inquiry](company-voice/02-inquiry.jpg): “Tell us” introduces the three required fields. Synthetic name, email and question are filled; practice details and estimate stay optional.
3. [Email draft](company-voice/03-draft.jpg): “Review email draft” shows the company recipient, the question and the synthetic contact. The page says “Nothing has been sent.” The estimate is absent and keyboard focus lands on the draft heading. Stop before “Open email draft.”

The browser used `http://127.0.0.1:4187/`. The [preview manifest](company-voice/build-manifest.json) records clean runtime inputs and artifact `e571fbae28ba2312f98d4e5c8c51687ce4db27edb1ef85ee2f6881dceb2ad5c2`. All 27 source hashes and 20 served asset hashes matched. [Walkthrough proof](company-voice/walkthrough.json) binds the three screenshot hashes to that build; [DOM observations](company-voice/browser-observation.json) contain synthetic data only.

No email app was opened, email sent, collector enabled, PR merged or site deployed. This proves the local path and company wording; it does not prove email delivery, live ingestion, customer acceptance or conversion lift. Earlier review and browser evidence remain tied to their own source revisions.

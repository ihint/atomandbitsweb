# Claims Native inquiry recipient

October 16, 2026. Ian chose `daniel@claimsnative.com` for the marketing contact and inquiry flow. Input: growth `eb795564942414ba5def21841bebad6f2e462f38`.

Expected: every Claims Native marketing email link, fallback, draft recipient and service contact uses that exact address. Keep the “we/us” copy, legal operator, offer, source labels, three required fields, optional estimate and local draft behavior. This is a user-selected named address; do not call it a verified shared inbox.

Checks: inspect the address-only diff; run the existing marketing gate; have a separate agent check routing and stale-address cases; rebuild from committed inputs and show the local synthetic unsent draft. Keep old evidence tied to its original source. Stop before opening the email app.

Critical failures: a wrong or stale recipient, lost subject/body encoding, invented shared-inbox or delivery proof, sent email, collector activation, merge or deployment. Passing local checks does not prove delivery or Daniel's receipt.

## Result

Runtime `1f64c297d21dab645b2cb709636dc28420f0aa6b` changes 28 recipient references: all 20 HTML email links, four service-contact schema entries, three JavaScript draft/reset paths and one existing measurement fixture. The calculator script cache version moves to `20261016-3`. A mechanical comparison confirmed these are the only changes to the ten source/fixture files. The “we/us” copy stays in place.

A separate read-only Codex agent found no actionable findings after parsing the eight pages and checking the pinned diff, draft/reset paths, fallback, encoding and retained inquiry behavior. Its [report](contact-recipient/independent-review.md) and [provenance](contact-recipient/review-provenance.json) distinguish that source review from the author's checks.

The author gate passed 41 tests, production/preview builds, eight pages, 151 local references, seven sitemap entries and manifest checks. See the [gate log](contact-recipient/gate.txt).

## Local proof

The fresh preview at `http://127.0.0.1:4187/insurance-opportunity/#review` uses the clean committed runtime. With synthetic name, email and question, “Review email draft” shows `To: Claims Native <daniel@claimsnative.com>` and “Nothing has been sent.” The mailto points to that exact address with the subject and body encoded. Only three fields are required; the estimate stays off and is absent. Focus lands on the draft heading. No email app was opened.

The [screenshot](contact-recipient/unsent-draft.jpg), [DOM observations](contact-recipient/browser-observation.json), [build manifest](contact-recipient/build-manifest.json) and [walkthrough proof](contact-recipient/walkthrough.json) bind this result to artifact `8df14a3b387b361169c35a4f870faedab61e4c0766adedbe230af55a46c97f98`. All 27 source hashes and 20 served asset hashes matched.

No email was sent, collector enabled, PR merged or site deployed. This address is Ian's chosen contact; no shared-inbox, delivery or recipient-acceptance proof is claimed. Earlier company-voice and conversion evidence keeps its original source and recipient.

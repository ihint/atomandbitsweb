# Claims Native: accepting insurance

Date: 2026-09-14
Source: Ian approved the outcome-led positioning and asked to remove chiropractic specifics in Codex task 01a0a108-2b46-7e43-9e56-a23461c4eb3a.
Baseline: main fa548c5, including website PR 43.

## Expected behavior

Lead with accepting insurance without building a billing department. Explain claims, payment review and follow-up. Speak to independent practices already accepting insurance and those considering it. Remove specialty-specific public copy, metadata and navigation. Replace the specialty page with an independent-practice page while preserving existing links. Keep sample labels, clinical decisions, contract checks, and agreement on price and service scope.

Critical failures: imply support for every specialty, payer or service; claim live delivery or guaranteed payment; lose sample amounts or clinical authority; break account links, calculator or old URLs; leave chiropractic positioning in public copy.

## Checks planned

Run the existing build and redirect checks. Check both the source site and the built domain for broken local links, metadata, FAQ parity and removed specialty wording. Review desktop, 390px and 320px layouts and inspect disclosures, calculator and old-route behavior. Compare changed wording against plain-language rules. These checks establish copy and website behavior, not buyer acceptance or service readiness.

## Status

Implemented and checked locally. Pull request and publication status are recorded in the task and iBrain.

## Copy review

Stale or vague phrases removed: “We’ll focus on the rest,” “every dollar explained,” “Your kind of help,” and “fill the rest of your day.” The replacements name accepting insurance, claims, payment review and follow-up.

Long-word review: retained “insurance,” “independent,” “department” and “participation” because shorter words would change the meaning. “Integration” becomes the concrete source-access check on the practice page; the homepage retains the explicit EHR-connection limit.

Words cut from edited passages: “you may be the provider, the office manager, or both”; “each week”; the three-fragment Jane/payment-tool/spreadsheet example; “starting with chiropractic practices”; and “we’re starting with scoped chiropractic work.” The specialty and vendor-example cuts follow Ian's request to remove chiropractic specifics. The sample numbers, people and company names outside that removed example stay unchanged.

Passive wording reviewed: “Handled for your practice” becomes “Claims Native handles”; the walkthrough's “is being built to handle that follow-up” becomes “Claims Native could handle.” The practice-page phrase “is being built” remains to state current delivery limits. The homepage keeps its existing development wording in the service explanation.

Rewrites:

| Before | After |
| --- | --- |
| You focus on your patients. We’ll focus on the rest. | Accept insurance. Without building a billing department. |
| Claims, payments, and insurance follow-up. Handled for your practice, with every dollar explained. | Claims Native handles the work between your practice and insurance companies, from claims and payment review to follow-up. |
| One practice. Your kind of help. | Adding insurance? Already accepting it? |
| Your patient leaves. Billing shouldn’t fill the rest of your day. | You see the patient. We follow up with the insurer. |
| Start with the billing you want us to handle. | Start with the insurance work you want us to handle. |
| For chiropractors | For independent practices |
| Which billing work keeps coming back? | What would help you accept insurance? |

The line-by-line specificity review keeps the approved headline and concrete work examples. This is the author's review, not a claim of unique positioning or buyer comprehension. No claim of support for all specialties, payers or services was added.

## Verification results

- `bash scripts/test-claimsnative-pages.sh`: build and copy guards passed; both redirect-worker tests passed.
- Source site: six HTML files and 78 local references passed. Built Claims Native domain: six HTML files and 74 local references passed. Six includes the old-route redirect stub.
- Both versions passed four visible/structured FAQ pairs, title/description checks, both practice paths, account links, preserved sample amounts and clinical-authority checks. No chiropractic or ChiroTouch copy remains in public HTML. The old path remains only for link compatibility; historic docs retain their dates and meaning.
- Browser: five content pages at 1280px, 390px and 320px each had one H1, no specialty copy and no horizontal overflow. Visual review found the homepage invitation too narrow at 320px; the narrow-phone button now gets a full row and the headline uses a smaller size. Final homepage checks cover all three widths.
- The payment disclosure still shows the sample $88 charge, $40 insurer payment, $20 patient payment, $4 adjustment and unresolved $24, with the contract check pending. The live-billing FAQ retains preview and scope limits. The main invitation opens the walkthrough.
- Calculator: changing the sample frequency input from two to three patients per week produced $9,750 monthly, $117,000 annual and 156 patients. No draft or message was sent.
- Wrangler 4.125.0 parsed five redirect rules. The old path with no slash, with a slash and with index.html each returned HTTP 301 to the new page, preserved `?source=review` and ended at HTTP 200. Both legacy prefix routes also ended at HTTP 200. [Cloudflare's redirect rules](https://developers.cloudflare.com/pages/configuration/redirects/) support this configuration.
- The source-host browser fallback reached the new page and retained query and fragment. The no-script meta-refresh uses a relative path that works in both hosts' directory layouts; its static destination was checked separately.
- `git diff --check` passed.

Local setup failures: global Wrangler 4.45.0 could not write its log/registry under the filesystem restrictions. The release-pinned Wrangler 4.125.0 could not run a September 11 compatibility date because its runtime supports August 27. The passing redirect checks used the pinned CLI, temporary log/registry directories and compatibility date 2026-08-27. This is local static-route proof, not a new production deployment.

Current result: implementation ready for review. Customer acceptance, live service readiness and production publication remain separate. The website's current app-preview and practice-specific service agreement still apply.

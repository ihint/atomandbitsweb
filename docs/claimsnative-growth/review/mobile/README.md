# Mobile review, repairs and growth program

Date: October 17, 2026. Scope: homepage, keeping-your-EHR guide, billing-setup guide, remittance/deposit guide, and the local inquiry to `daniel@claimsnative.com`. User goal: help a practice understand fit, find its next step and review an email without sending it. Both website PRs stay unmerged/undeployed; #55 remains draft. No routine human review was needed.

Baseline `2dd6842` includes positioning `e94a888`; combined comparison starts at main `a8a0c6a`. Before screenshots use clean preview source `3fa91f6`, with all 27 runtime/build input hashes verified equal to `2dd6842`. First repairs are `9768770`. Final runtime is `1b89643b57a1bef3371c4ac43796c2ac541d28a5`; its preview artifact is `ccb45cd8b0e5f4ad61a7256057aeb75df306ad608eae8f84a344b01ef89842b6`. The manifest and source proof bind 27 source inputs and 17 HTTP-served assets. The evidence commit adds no runtime input.

## Standards

[Independent source report](mobile-standards-source-review.md): P2 homepage mail-handler dependency and P3 difficult manual copying. No material documented hard violation or Fowler smell. [Closure](closure-standards-review.md): no P1/P2; one P3 about overstating source continuity. The [fresh final correction review](final-corrections-review.md) confirms the corrected labels and scope note, with zero actionable findings in that last delta.

## Spec

[Independent source report](mobile-spec-source-review.md): P2 missing homepage question entry and P3 difficult copying. Question-only, optional estimate, company voice, recipient, readiness limits and privacy behavior match the inspected contract. [Closure](closure-spec-review.md): no P1/P2; one P3 because the proposed plan scheduled already implemented work. The final correction review confirms the plan now marks that work implemented and awaiting release.

Each axis reported two initial UX findings and one later clarity finding. The initial two findings overlap across axes; there were four distinct source-confirmed issues, all fixed. Do not sum overlapping tests or count the reports as separate defects. Original reports remain intact; the first two screenshot-only attempts are retained as incomplete, not zero-finding clearances.

## Journey and screenshot evidence

1. **Homepage entry.** [Before](before/home.jpg), [after](after/home.jpg), and [readable guide index](after/guide-index.jpg). Talk-first copy now reaches the local question form as well as direct email. The guide index appears after the hero; a fee/scope anchor reaches the existing offer. Primary headline, CTA and price stay.
2. **Keep your EHR.** [Before](before/ehr.jpg) and [after](after/ehr.jpg). The direct answer now has an early question link, while the full explanation and closing CTA remain. No account or estimate is needed. Export/access/return-path and readiness limits stay.
3. **Billing setup.** [Before](before/setup.jpg) and [after](after/setup.jpg). The same early question pattern keeps the enrollment and handoff explanation readable. No enrollment, connection or live-filing acceptance is inferred.
4. **Remittance and deposit.** [Before](before/remittance.jpg) and [after](after/remittance.jpg). An early question path and a contextual homepage link make this guide easier to find. A remittance remains distinct from bank receipt and unexplained differences remain open.
5. **Inquiry and email handoff.** [Before form](before/inquiry.jpg), [before draft](before/draft.jpg), [revised draft controls](after/draft-top.jpg), and [final local preview](after/final-mobile-preview.jpg). Required fields stay name, email and question. Three controls copy the address, subject and message separately; native email and manual selection remain available. Success/failure feedback says nothing was sent. Edits/reset and replacement drafts suppress stale content and pending copy confirmations. Source labels use “First observed” and “Current,” with their page/tab limit explained. Event property names and privacy filters are unchanged.

The guide/article and first revised-draft screenshots are at `9768770`. Only source-label wording and plan status changed in `1b89643`; the final mobile screenshot and current-source layout observations are at that final runtime. Snapshot hashes are in [the image index](screenshot-hashes.json). Screens show synthetic contact details only.

## Strengths and opportunities

The existing design reflows, keeps useful direct answers in HTML, explains optional inputs and carries readiness limits beside service claims. Draft focus, native labels and the 16px form text help phone use. The change adds entry points and a usable handoff without creating a false sent/received state. There is no unresolved actionable review finding within this scope; these checks are not full accessibility acceptance.

The next growth gap is actual receipt and follow-through. [The growth program](../../growth-plan-20261017.md) ranks receipt/activation, referrals, useful distribution, real proof stories and a later capped search experiment. It includes proposed owners, evidence, stopping rules, economics, current official sources and four unsent distribution drafts. Early links/copy controls are implemented in #55; intake/backend, app changes, campaigns and business targets remain proposals.

## Verification and limits

- Parent full gate: **44 tests passed** (31 inquiry/measurement Node, two redirect Node, ten scorecard Python and one manifest Python), production/preview builds, eight HTML pages, 161 local references and seven sitemap URLs. [Gate log](gate-final2.log).
- Fresh source agents ran 28 overlapping Node cases each. Closure Standards ran 31; Spec ran 33 including redirects; the final correction agent ran 31. No independent full build or full-gate reproduction is claimed.
- Author browser at `9768770`: 11 recorded journey checks, including required/invalid inputs, omitted optional values, estimate selection/deselection, edits clearing stale content, all three copy controls, clipboard text equality, focus, 320px draft and homepage guide navigation. [Earlier proof](browser-proof.json).
- Final `1b89643`: 15 reflow checks across the five pages at **320, 390 and 1280 CSS pixels**, no horizontal overflow; a fresh guide-to-question-to-unsent-Daniel draft confirms final source labels. [Final proof](final-browser-proof.json).
- Clipboard denial/missing API, reset and pending-copy races pass deterministic tests. They were not forced in the real browser. No email app was opened or email sent. Mobile is a desktop-browser responsive check, not a physical iOS/Android keyboard, VoiceOver or complete WCAG audit.
- First two agents inspected six screenshots but source reads failed on a malformed child PATH. Fresh child processes used a clean PATH with shell snapshots disabled, preserving the read-only sandbox. Their source/test checks ran; later hash/build probes hit the remaining sandbox temporary-file denial. Parent verification supplies that evidence; blocked independent checks stay visible.
- The viewport-control request did not change the observed existing width; one nominal 320px attempt still measured 390px and a new tab measured 1280px. Those attempts are not counted as 320px proof. Fixed-width same-origin frames then measured exactly 320/390, with 1280 measured on standalone pages. Temporary viewport overrides were reset. Tall homepage images shrink in the image viewer; source, readable index and frame evidence supplement them.
- Reports, agent thread IDs, token usage where emitted and report hashes are in [provenance](provenance.json). Resolved model names and cash cost were not emitted. No raw agent event stream is committed.
- No fresh full canonical interception, live analytics, performance benchmark, mail receipt, external signup acceptance, clinical/legal approval, indexing/citation result, conversion lift, customer or cash result is established. Public signup and one Bing help fetch did not render in the research tool; they are not verified product failures.

Next: keep the draft and local preview available; have agents prove private inquiry receipt and the existing signup-to-activation path before an approved traffic experiment. No sends, campaign launch, account/credential, security-setting, collector activation, merge or deployment follows from this review.

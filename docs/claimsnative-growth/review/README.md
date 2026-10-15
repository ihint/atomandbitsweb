# Independent agent review and repair

Date: October 15, 2026. Original growth head: 1da3f64 against positioning base 52fd2c1. Website changes stay local and unpublished. The author coordinates fixes; two separate Codex CLI agents review read-only. No human reviewer is required for this repair.

## Standards

[Initial report, preserved verbatim](initial-standards.md): four P2 findings, covering refund links/balance/order, payments before inquiry receipt, older opportunities bypassing stage checks, and missing test/spam flags. The agent ran 18 Node checks, five Python checks and shell syntax checks, then reproduced the counterexamples. Build/browser evidence received source inspection only.

## Spec

[Initial report, preserved verbatim](initial-spec.md): three P2 findings, covering consent toggles resetting deduplication, internal partial campaign tags losing conversion source, and missing browser source identity. The agent ran 16 measurement and five scorecard checks and reproduced both behavior defects. It also identified inherited unproved EHR claims as a publication issue.

Initial totals: Standards 4, worst P2 financial reconciliation; Spec 3, worst P2 source attribution/deduplication and evidence identity. These are agent findings, not human acceptance or production proof.

## Repairs verified

- Validate all included lead stages before filtering the cohort. Require explicit exclusion flags and source evidence for counted qualification, booking and payments.
- Reject payments before inquiry receipt. Validate a refund's original positive receipt, matching opportunity, date and cumulative balance. Preserve distinct cash-week and cohort counts.
- Keep page-level deduplication across consent changes. Keep the eligible conversion source on internal navigation with non-source campaign labels; a new approved source replaces it.
- Generate a build manifest with commit identity, clean-input flag, source hashes and exact artifact hashes. Browser scripts verify every served asset against that manifest and save it with the results. A mutation test rejects changed bytes.
- Qualify inherited live EHR/eligibility/filing assertions on the home, setup and chiropractic pages, including matching metadata/FAQ text. Keep existing routes, prices and positioning branch intact.
- Replace routine human-led reporting/qualification with agent preparation from approved records. Human involvement is limited to missing authority/access, required signatures or unresolved professional/business judgment. No new outside-action authority follows.

New regression cases fail against the original source and pass against the repair. The original unbound evidence is preserved in initial-evidence/. The full marketing gate passes 31 tests: 18 measurement, two redirects, 10 scorecard and one manifest-mutation case. Both builds, eight HTML pages, 147 local references, seven sitemap entries and the manifest hash checks pass.

## Reviewer execution limits

The first Codex launches failed on local runtime permissions, then on the saved model alias being unsupported by the signed-in CLI account. Separate read-only agents ran after using the CLI's own default configuration for this invocation only. Persistent settings were unchanged. Exact resolved model identity was not emitted; it is not inferred from the author's model or the unsupported alias. Token usage is available in local run records; dollar cost was not exposed.

Automatic approval review rejected the attempted transfer of private source to external Claude because the payload/destination lacked specific authorization. That transfer was not executed, and Grok was not used as a workaround. The completed reviews stayed in Codex. No website push, PR, deployment, collector activation, outside contact or production setting change occurred.

## Final closure

[Independent follow-up report](followup.md) closes all four Standards and three Spec findings on repaired code commit `3e59bae0019ced63e8036bf8bffe30c0e546fffd`. No new actionable defects remain in that scope. It independently ran 20 Node checks and 10 scorecard tests, verified all 27 source hashes against that commit, and reproduced all 21 built-asset hashes in memory. It inspected the browser/build evidence; those runtime executions remain attributed to the author. A nested review-helper launch was unavailable, so the independent closure agent completed both axes itself. The two initial reviewer contexts remain distinct.

The current layout, event and performance JSON files each contain the full verified build manifest. The source-input flag is clean, the tested revision is `3e59bae`, and artifact ID is `b0e8a8bbbaf03761b6053d754ca0a7a576e9fe29eab2c617b1c3b3e180ede39c`. Browser scripts fetched and hashed every served asset before running. All 24 layouts fit; the intercepted browser fixture verified consent, re-consent retry protection, partial internal campaign tags, safe payloads, draft truth and navigation suppression. Four expected events were intercepted, with zero forwarded collector requests or outside actions.

Six cold-cache guide runs measured desktop LCP 108–128 ms and throttled phone LCP 616–624 ms, with CLS 0. These are one local smoke run per page/viewport, not production or field performance. JSON records and the checked manifest retain the actual numbers.

The only post-review source change is a documentation clarification that an agent can perform the bounded AI-answer check through an approved UI, one question at a time. It grants no scraping, schedule, contact or publishing authority. Runtime/build inputs are unchanged from the independently reviewed commit; a later evidence-only commit does not require a new browser run when those hashes match.

**Status:** ready as an unpublished review package. No human reviewer was needed. Actual production settings, account access, live analytics ingestion, legal/clinical approval, customer receipt and revenue remain separate facts, unproved here. No website push, PR, publication, deployment, collector activation or new spend occurred. Ian's agent-first preference is preserved in shared iBrain context through its separate verified publication.

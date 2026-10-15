# Independent agent review and repair

Date: October 15, 2026. Original growth head: 1da3f64 against positioning base 52fd2c1. Website changes stay local and unpublished. The author coordinates fixes; two separate Codex CLI agents review read-only. No human reviewer is required for this repair.

## Standards

[Initial report, preserved verbatim](initial-standards.md): four P2 findings, covering refund links/balance/order, payments before inquiry receipt, older opportunities bypassing stage checks, and missing test/spam flags. The agent ran 18 Node checks, five Python checks and shell syntax checks, then reproduced the counterexamples. Build/browser evidence received source inspection only.

## Spec

[Initial report, preserved verbatim](initial-spec.md): three P2 findings, covering consent toggles resetting deduplication, internal partial campaign tags losing conversion source, and missing browser source identity. The agent ran 16 measurement and five scorecard checks and reproduced both behavior defects. It also identified inherited unproved EHR claims as a publication issue.

Initial totals: Standards 4, worst P2 financial reconciliation; Spec 3, worst P2 source attribution/deduplication and evidence identity. These are agent findings, not human acceptance or production proof.

## Repairs prepared

- Validate all included lead stages before filtering the cohort. Require explicit exclusion flags and source evidence for counted qualification, booking and payments.
- Reject payments before inquiry receipt. Validate a refund's original positive receipt, matching opportunity, date and cumulative balance. Preserve distinct cash-week and cohort counts.
- Keep page-level deduplication across consent changes. Keep the eligible conversion source on internal navigation with non-source campaign labels; a new approved source replaces it.
- Generate a build manifest with commit identity, clean-input flag, source hashes and exact artifact hashes. Browser scripts verify every served asset against that manifest and save it with the results. A mutation test rejects changed bytes.
- Qualify inherited live EHR/eligibility/filing assertions on the home, setup and chiropractic pages, including matching metadata/FAQ text. Keep existing routes, prices and positioning branch intact.
- Replace routine human-led reporting/qualification with agent preparation from approved records. Human involvement is limited to missing authority/access, required signatures or unresolved professional/business judgment. No new outside-action authority follows.

New regression cases fail against the original source and pass against the repair. The original unbound evidence is preserved in initial-evidence/. Current build/browser reruns and independent follow-up are still pending at this checkpoint; do not treat this checkpoint as final acceptance.

## Reviewer execution limits

The first Codex launches failed on local runtime permissions, then on the saved model alias being unsupported by the signed-in CLI account. Separate read-only agents ran after using the CLI's own default configuration for this invocation only. Persistent settings were unchanged. Exact resolved model identity was not emitted; it is not inferred from the author's model or the unsupported alias. Token usage is available in local run records; dollar cost was not exposed.

Automatic approval review rejected the attempted transfer of private source to external Claude because the payload/destination lacked specific authorization. That transfer was not executed, and Grok was not used as a workaround. The completed reviews stayed in Codex. No website push, PR, deployment, collector activation, outside contact or production setting change occurred.

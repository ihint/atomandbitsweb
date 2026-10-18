Read-only audit: app `f7da99f486840538406c5dd948fe47a55c2919ac`; marketing `fde71f0378487952283073f687b40f7c24ebe028`.
Passed 31 inquiry/measurement tests and 10 scorecard tests.
No edits, sends, accounts, private-memory access or production actions.

1. **P2 — “Received” lacks required receipt evidence.** [claimsnative-scorecard.py:50](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/scripts/claimsnative-scorecard.py:50) requires `received_at`, but no inbox receipt reference; [line 156](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/scripts/claimsnative-scorecard.py:156) counts it. The [lead schema:1](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/docs/claimsnative-growth/lead-ledger-template.csv:1) has no receipt field. **Reproduction:** the passing [test:9](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/tests/claimsnative-growth/test_scorecard.py:9) supplies two opportunities without inbox evidence and reports two received, one qualified. **Impact:** an entered timestamp can promote an unsent question into the receipt cohort; dedupe only protects repeated opportunity keys. **Smallest fix:** require a private destination-scoped message reference and receipt-evidence pointer before counting; reject reuse across opportunities. Preserve manual merging of distinct threads concerning one buying decision. A pointer supports reconciliation; it does not itself prove delivery.

The frontend accurately says “Nothing has been sent” at [insurance-opportunity/index.html:203](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/claimsnative/insurance-opportunity/index.html:203). Draft → email action → authoritative destination receipt → private reconciliation → evidenced qualification is the supported path. Deferred server intake and disabled analytics are intentional holds, not defects. Keep company “we/us” and service-readiness limits.

Existing reusable app records are verified `identity_accounts`, tenant-bound practice onboarding, and `signup_notifications`. [practice_access.py:442](/Users/ianharman/HarmanandSons/output/worktrees/inquiry-activation-audit/claims_native/practice_access.py:442) verifies identity before saving the account. These support account/setup evidence; they are not an anonymous inquiry store or proof of qualification. No implemented general lead store was found in the inspected source. Any later intake integration should use named commands and preserve tenant authority, with no private database writes in handlers.

[signup_notifications.py:145](/Users/ianharman/HarmanandSons/output/worktrees/inquiry-activation-audit/claims_native/signup_notifications.py:145) distinguishes retryable connection failures, refusals and uncertain sends; uncertain outcomes are held. [Migration 070:240](/Users/ianharman/HarmanandSons/output/worktrees/inquiry-activation-audit/claims_native/persistence/postgres_migrations/070_binding_signatures_and_signup_alerts.sql:240) enforces account/kind uniqueness. No confirmed notification defect emerged.

**Local receipt acceptance cases and fake-message plan:**

- Prepare/open/cancel a synthetic draft: zero received opportunities and zero acceptance events.
- Feed a fake destination receipt twice: one opportunity; replay leaves counts unchanged. Conflicting reuse fails; missing source stays unknown.
- Add qualification evidence for fit, need, authority and plausible scope: one qualified practice. Missing receipt or qualification evidence blocks promotion.

Use in-memory fixtures and a fake mailbox adapter; send nothing. Mock notification acknowledgement, connection failure and timeout separately. Database concurrency and rollback checks need an isolated permitted runner.

**Proof gaps:**

- Daniel mailbox receipt/routing and approved private ledger location remain unproved. Supplied Gmail identity is Ian, not Daniel.
- No actual message-to-opportunity reconciliation, duplicate-thread merge or qualified-practice evidence.
- Signup GET proves availability only; verification delivery, worker deployment, migrations/grants, Slack acknowledgement and channel receipt remain unknown.
- App sender dependencies were unavailable; PostgreSQL checks were not run. A separate Bash heredoc reproduction was blocked by temporary-file restrictions; no workaround used.
- Model and cost were not emitted.
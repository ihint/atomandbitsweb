## Standards

Four reproducible correctness defects violate the documented reconciliation rules; these are not style heuristics.

- **P2 — Refund links are not validated.** [claimsnative-scorecard.py:49](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/scripts/claimsnative-scorecard.py:49): A $500 receipt plus a −$100 refund referencing a nonexistent receipt produces $400 net. A refund dated before its original receipt also passes. Validate original receipt existence, opportunity, ordering and refundable balance before counting it.

- **P2 — Payments can predate inquiries.** [claimsnative-scorecard.py:47](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/scripts/claimsnative-scorecard.py:47): An October 12 payment joined to an October 13 inquiry and October 14 pilot produces one paid pilot and $500 revenue. No check catches this inconsistent join. Validate payment timing against the opportunity’s receipt date.

- **P2 — Older opportunities bypass stage validation.** [claimsnative-scorecard.py:57](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/scripts/claimsnative-scorecard.py:57): An October 1 inquiry with September 1 qualification, no qualification evidence and an unverified October 14 booking passes and contributes $500 cash. The cohort filter skips validation, contradicting the documented promise that missing evidence stops reporting. Validate all included opportunities before filtering counts.

- **P2 — Missing exclusion flags silently include records.** [claimsnative-scorecard.py:16](/Users/ianharman/HarmanandSons/output/worktrees/claimsnative-growth/scripts/claimsnative-scorecard.py:16): Removing test/spam columns still produces one inquiry, one paid pilot and $500. Require the documented explicit flags so incomplete exports cannot silently include test or spam records.

Executed: `node --test tests/claimsnative-growth/measurement.test.cjs claimsnative/cloudflare-www-redirect/test/redirect.test.mjs` passed 18 tests; `python3 -B -m unittest discover -s tests/claimsnative-growth -p 'test_*.py'` passed five; `bash -n` passed both build/test scripts. Inline `python3 -B -c` reproduced all counterexamples. An earlier heredoc attempt was blocked by filesystem restrictions.

Build/CI and saved browser evidence received source inspection only; I did not rerun builds or browsers. Inherited posting/eligibility claims remain unverified, as proof.md acknowledges, and require substantiation before publication.

HEAD remained `1da3f64acca7123f98d4e162a62388c93b50fb54`. An untracked review directory appeared during review; I made no writes or external changes.
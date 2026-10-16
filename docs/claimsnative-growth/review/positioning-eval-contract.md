# Growth draft and positioning check

Date: October 15, 2026. Requested result: open the reviewed growth branch as a draft PR, check it against the positioning work, and leave both unmerged and undeployed. Use agents first.

Inputs: reviewed growth `355cc8b18202114d2ece273299354aaaaa8723cf`; positioning PR #54 at `e94a8884b22e4bfe68857221b46e810979806dde`; production main `a8a0c6a2a82c23b2e99bb3c0828a795a0fd7b35d`.

Expected: preserve PR #54's nationwide, cross-specialty and keep-your-EHR positioning, its “Another EHR” signup correction, existing prices/routes and direct-connection limit. Preserve growth event attributes, consent/privacy rules and readiness limits. Resolve the three overlapping invitation lines without discarding either change. The independent agent must inspect the combined source and report what it actually checked.

Checks: run the full marketing gate on the combined tree, bind a fresh local browser build to committed source, rerun all 24 layouts and the intercepted event fixture. Earlier performance evidence remains pinned to its original source and is not relabelled. Check that the PR is draft, targets the positioning branch, contains its current head, has no auto-merge and cannot run the repository's production deploy jobs. Recheck both remote base heads before publishing.

Failure: lost positioning or signup fixes, lost measurement attributes, unqualified live-service claims, leaked form data, fabricated review/test results, merge to main, deployment, collector activation or new spend. No human reviewer is needed for routine source and evidence checks. Legal review, real signup acceptance, live ingestion and customer/revenue outcomes remain outside this check.

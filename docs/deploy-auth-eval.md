# Deployment authentication repair

Date: October 27, 2026.
Source: Ian requested the GitHub deployment-token repair after PR 72 shipped.

Expected outcome: a main-branch workflow authenticates through an environment
secret, deploys the site Worker and www redirect, and serves the expected files.
A missing token must fail before either deploy step. Limit access to the
resources and permissions needed by this release. Keep tokens out of source,
logs, task output and shared context. Do not change page content or mail handling.

Checks: exercise the missing-token guard with an empty value and an inert test
value; run the existing suite; inspect final CI step results and live files.
Secret metadata is only setup proof. A completed workflow with skipped deploy
steps, or a direct local deployment, does not pass the CI acceptance check.

Local checks: all 33 tests pass. The actual guard script exits 1 with an empty
token and 0 with an inert test value; neither result prints the value. Pull
requests remain test-only, and main uses the production environment. Git diff
whitespace checks pass. Credential setup and a real CI deploy remain pending.

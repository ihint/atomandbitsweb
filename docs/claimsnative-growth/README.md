# Claims Native growth foundation

Prepared October 15, 2026 for a draft PR. Ian authorized branch publication and the draft; merge, website deployment and collector activation remain on hold. No account, credential, DNS, security setting or production configuration changed.

The [independent agent review and repair](review/README.md) records findings, fixes and source-bound evidence.

The [current positioning comparison](review/positioning-comparison.md) records the combined source, signup fix, fresh browser proof and independent agent review.

The [October 16 clarity and conversion review](review/conversion/README.md) supersedes the earlier inquiry-flow snapshot. Independent agents found five distinct issues and verified the repairs. Guide readers can prepare a question on the site; only name, email and question are required. An estimate is optional. The HTML form stays disabled until its local draft handler is ready. The draft PR and local preview are updated; both PRs remain unmerged and undeployed.

Start with [the stack and audit](stack-and-audit.md), then [events and attribution](events-and-attribution.md). Agent setup checks and remaining decisions are in [setup](owner-setup.md). [The 30-day plan](content-and-experiments.md) ranks pages and experiments; [the scorecard](weekly-scorecard.md) connects source to received inquiries, qualified practices and cash. [Proof](proof.md) records checks and gaps. The [eval contract](eval-contract.md) states the acceptance rules.

The branch is `codex/claimsnative-growth-foundation`. Its draft targets the positioning branch `claude/claimsnative-website-positioning-91bf6b` at `e94a888`, PR #54. Combined source `1cf8ebf` includes that head. Production main remained `a8a0c6a` when rechecked. The dependency must be resolved before a later release; do not apply both as competing rewrites. Website PRs #51–53 propose separate copy and offer changes and are not included. No messages were sent to the other work chats.

Review the production-format artifact locally:

```sh
bash scripts/test-claimsnative-pages.sh
bash scripts/build-claimsnative-pages.sh /tmp/claims-review production
python3 -m http.server 4187 --bind 127.0.0.1 --directory /tmp/claims-review
```

The default build environment is `preview`, with noindex HTML/header and no sitemap. Only the existing production workflow requests `production`. The collector also requires the exact `claimsnative.com` host, a configured public PostHog key and affirmative consent. Local review does not send events. The browser proof uses intercepted synthetic requests, not the production collector.

This foundation supports manual inquiry-to-customer attribution. The site still has an email-draft form, no server intake and no scheduler. A generated draft is never reported as received. Signup happens in the separate app and does not receive new tracking identifiers. Real collected revenue and conversion improvement are unmeasured.

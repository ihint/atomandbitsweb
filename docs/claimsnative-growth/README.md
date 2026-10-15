# Claims Native growth foundation

Prepared October 15, 2026 for review. No account, credential, DNS, security setting, production configuration, content publication, deployment or outside message changed.

Start with [the stack and audit](stack-and-audit.md), then [events and attribution](events-and-attribution.md). Owner actions are in [setup](owner-setup.md). [The 30-day plan](content-and-experiments.md) ranks pages and experiments; [the scorecard](weekly-scorecard.md) connects source to received inquiries, qualified practices and cash. [Proof](proof.md) records checks and gaps. The [eval contract](eval-contract.md) states the acceptance rules.

The local branch is `codex/claimsnative-growth-foundation`, based on the separate positioning commit `52fd2c1`. Production main was `a8a0c6a` when checked. Merge or adopt the positioning change before this dependent work; do not apply both as competing rewrites. Other open offers and price changes in website PRs 51–53 remain separate owner decisions. No messages were sent to the other work chats.

Review the production-format artifact locally:

```sh
bash scripts/test-claimsnative-pages.sh
bash scripts/build-claimsnative-pages.sh /tmp/claims-review production
python3 -m http.server 4187 --bind 127.0.0.1 --directory /tmp/claims-review
```

The default build environment is `preview`, with noindex HTML/header and no sitemap. Only the existing production workflow requests `production`. The collector also requires the exact `claimsnative.com` host, a configured public PostHog key and affirmative consent. Local review does not send events. The browser proof uses intercepted synthetic requests, not the production collector.

This foundation supports manual inquiry-to-customer attribution. The site still has an email-draft form, no server intake and no scheduler. A generated draft is never reported as received. Signup happens in the separate app and does not receive new tracking identifiers. Real collected revenue and conversion improvement are unmeasured.

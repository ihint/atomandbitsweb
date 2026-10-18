# Weekly scorecard

Proposed agent reporting cadence: Monday, previous Monday–Sunday in America/New_York. Store exports in approved private records. The baseline is **not collected**, not zero. No dashboard or account was created.

| Metric | Count and rate | Source and interpretation |
| --- | --- | --- |
| Search visibility | Impressions; clicks; clicks / impressions | Search Console and Bing, by landing page/query where available; branded and practice-help intent separate. |
| Relevant landing traffic | Visits to the three guides, setup page, specialty page and calculator; each / all marketing visits | Cloudflare Web Analytics, grouped by supported referral fields. Do not pretend its visit count identifies people. |
| Public actions | CTA, form-start, draft and email-action event counts; actions / 100 relevant visits, labeled actions per visits | PostHog total counts if enabled. Consented visitors are a subset; not a joined conversion funnel. Unique-user reports are invalid with the shared transport ID. |
| Received inquiries | Distinct private opportunities with an inbox receipt this week; number with usable source / received inquiries | Inbox/lead ledger. Dedupe repeat contacts per practice buying decision. Do not count drafts or signup clicks. |
| Qualified practices | New qualified count; qualified from the week's inquiry cohort / received cohort count | Private review evidence. Show numerator/denominator and how many remain pending. The cohort rate matures over time. |
| Confirmed bookings | Distinct confirmed bookings this week; confirmed from inquiry cohort / cohort inquiries | Scheduling record/calendar evidence, not scheduling clicks. Count reschedules once, track cancellations separately. |
| Paid pilots | Distinct pilot opportunities with settled service payment; paid from inquiry cohort / qualified cohort | Pilot-start and paid are separate fields. Report both counts. |
| Collected revenue | Gross service receipts, refunds and net USD, plus paid opportunity count | Existing finance/payment receipts; do not use invoiced revenue or practice insurer deposits. Deduplicate receipt IDs in private records. |
| AI referrals | Observed ChatGPT/Perplexity/Claude/Copilot visits/actions/inquiries where evidence exists | Normalize hosts; direct/unknown remains a group. Self-reported AI is separate. No perfect AI attribution. |
| AI visibility | Platform-specific impressions/citations/cited pages, if available; counts with dates/definitions | Search Console limited-rollout generative report, Bing AI Performance and Cloudflare crawler metrics if enabled. No summing overlapping Google totals. Crawler activity is not a citation or customer. |

Use the same table for first-source and conversion-source views; label them rather than sum them. Include `direct_unknown` and `other_referral`. For each source show relevant visits if the platform supports them, received inquiries, qualified, confirmed bookings, pilot starts, paid pilots and net collected USD. Show a dash for an unavailable denominator or zero denominator; never turn it into 0%.

For sales rates use receipt-week cohorts observed through the report date, not “this week's payments divided by this week's new leads.” Cash this week may come from old inquiries; show that week's cash alongside the cohort view, not as its conversion numerator. Keep sample counts visible before drawing a conclusion.

## Manual reconciliation

Copy the CSV templates into an existing private system. Never commit populated files. Specialty/EHR can live in the approved lead record when needed for qualification; they are absent from the analytics payload and aggregate scorecard. Names and contact details remain in that system, not these templates. IDs and evidence URLs in the templates are private join keys only.

For each received email, verify it in the receiving inbox. Record its timezone-aware `received_at`, `receipt_destination`, a destination-scoped `receipt_message_key` and a private `receipt_evidence` pointer to the received message. A timestamp or copied draft alone is not a receipt. Use the same message key when replaying the same receipt; one destination and message key cannot belong to two opportunities. These fields stay private and do not appear in scorecard output. Then attach safe draft source labels or record unknown. Merge duplicate threads to one opportunity. Mark spam and staff/test records, and exclude them from rates and revenue. Match confirmed bookings and settled receipts to the opportunity using private records. Enter refunds as negative amounts in the payments file, with their own receipt ID linked to the original receipt. Count a paid pilot once even if it has multiple receipts. Keep qualification and declined/lost decisions; don't delete inconvenient rows.

Weekly check: (1) reconcile inbox receipts to new ledger rows, (2) reconcile booking evidence, (3) reconcile financial receipts/refunds, (4) total by first and conversion source, (5) review unknown coverage and pending ages. Use received_at for cohorts, settled_at for cash-week reporting, and America/New_York boundaries. Template fields are records, not new analytics properties.

Synthetic acceptance example: two received practice opportunities (google and direct_unknown), one qualified google practice, one verified booking, one pilot start and one settled $500 service receipt. A duplicate email and duplicate copy of the same receipt do not change the result; a test opportunity and spam are excluded. Expected: 2 inquiries, 1/2 qualified, 1/2 confirmed, 1 paid pilot and $500 net service revenue. These are test expectations, not business results.

## Repeatable private export

Run the count tool over privately stored CSVs (it prints source aggregates only):

```sh
python3 scripts/claimsnative-scorecard.py --leads /private/path/leads.csv --payments /private/path/payments.csv --week-start 2026-10-12 --as-of 2026-10-18 --source-model conversion
```

Repeat with `--source-model first`. Use timezone-aware ISO dates and explicit `true`/`false` test/spam flags. Identical duplicate keys collapse; conflicting duplicates, missing joins, missing explicit exclusion flags, missing inquiry receipt fields, receipts reused across opportunities and booking/qualification/payment without evidence stop the report. All included opportunities are validated before cohort selection. Payments cannot predate their inquiry. Refunds must link an included positive receipt for the same opportunity, follow that receipt, and stay within its remaining balance. Cash-week totals and inquiry-cohort counts stay separate. A paid pilot here means a started pilot with positive net settled service receipts as of the cutoff. Reconcile partial refunds and the actual commercial status in the private finance records. This CLI is not an analytics dashboard.

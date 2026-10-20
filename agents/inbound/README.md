# Inbound agent

A Cloudflare Worker that answers the atomandbits.com contact form in Ian's voice within seconds, holds anything sensitive for Ian, briefs Ian before booked calls, and sends every record to Hermes/iBrain through a signed webhook.

```
contact form ──POST /inquiry──▶ Worker ──200 {ok,id} in well under 1s
                                  │ (ctx.waitUntil, after the response)
                                  ├─ Claude drafts the reply + flags (phi, spam, needs_ian, sentiment)
                                  ├─ send policy ──▶ Resend (lead and/or Ian)
                                  └─ signed record ──▶ IBRAIN_WEBHOOK_URL, HERMES_WEBHOOK_URL
Cal.com ──POST /cal-webhook──▶ verify signature ──▶ brief (BOOKING_CREATED) ──▶ Ian + webhooks
```

## Endpoints

| Route | What it does |
|---|---|
| `POST /inquiry` | JSON `{name, email, organization, topic, timeline, goal, obstacle, page, website}`. Returns `200 {ok:true,id}` or `4xx {ok:false,error}`. `website` is a honeypot: when filled, the request gets `200` and is dropped. |
| `OPTIONS /inquiry` | CORS preflight. Allowed origins come from `ALLOWED_ORIGINS` (default `https://atomandbits.com`, `https://www.atomandbits.com`, and `http://127.0.0.1:*` / `http://localhost:*` for local review). Other origins get `403`. |
| `POST /cal-webhook` | Cal.com `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`, verified with `X-Cal-Signature-256`. Other events (such as the setup ping) get `200` and are ignored. |
| `GET /health` | `{ok:true, service, auto_send}` |

Error codes from `/inquiry`: `origin_not_allowed` (403), `expected_json` (415), `too_large` (413, over 16 KB), `invalid_json`, `missing_name|email|goal`, `invalid_email`, `<field>_too_long`, `invalid_<field>`, `turnstile_failed` (400), `rate_limited` (429).

Field limits: name 120, email 254, organization 160, topic 80, timeline 40, goal 3000, obstacle 3000, page 300 characters. `name`, `email`, and `goal` are required.

## Send policy

| Outcome | `AUTO_SEND=false` (default, draft-only) | `AUTO_SEND=true` |
|---|---|---|
| Clean draft | Draft emailed to Ian (`draft_to_ian`) | Reply sent to the lead from `FROM_EMAIL`, `Reply-To: REPLY_TO`, BCC `IAN_EMAIL` (`auto_sent`) |
| `phi_detected`, `needs_ian`, a draft that breaks a code-level rule, or a model error | Draft (if any) emailed to Ian marked **Hold** (`held_draft_to_ian`) | Holding note ("Thanks for your note. I'll reply personally shortly.") to the lead, plus an alert with the draft to Ian (`held_ack_sent`) |
| `spam` | Dropped; record still goes to the webhooks (`dropped_spam`) | Same |
| Honeypot filled | Dropped before any processing, not recorded | Same |

In draft-only mode nothing reaches the lead automatically. Ian's email has a link at the top that opens a new message to the lead with the draft already filled in, and its `Reply-To` is the lead, so either one click or plain Reply works.

Code-level backstops sit behind the model's own flags: a regex for obvious identifiers (SSNs, "DOB", member/record IDs) forces `phi_detected`; a draft over 260 words, a draft mentioning a dollar amount, or a draft linking anywhere other than atomandbits.com, claimsnative.com, or `BOOKING_URL` forces a hold. Every reply ends with "Ian" and the line "Drafted with my agent; I read every thread."

The holding note never repeats the sender's words. When PHI was detected it adds one line asking them to leave patient details out of email.

## Voice and prompts

- `voice.md` is the voice guide, built from the site's own copy: how Ian sounds, his offers, and the documented facts the agent may cite. It is published with the site, which is fine; keep anything private out of it.
- `src/prompt.mjs` holds the rules: no prices, scope, or dates; no clinical, legal, or financial advice; no claims beyond the documented facts; never repeat health information; 120 to 180 words; one or two sharp questions; offer the 30-minute conversation with `BOOKING_URL` when set, otherwise invite a reply with times. The sender's text is wrapped in `<inquiry>` tags and treated as data, not instructions. The sender's email address is never sent to the model.
- The system prompt (rules + voice guide) is static and marked with `cache_control`, so repeated calls read it from the prompt cache. Anything per request (the inquiry, the booking link) is in the user turn.
- The Claude call (`src/claude.mjs`) uses `claude-sonnet-5` (override with `CLAUDE_MODEL`), adaptive thinking, `CLAUDE_EFFORT` (default `medium`), structured JSON output, and server-side refusal fallbacks (`fallbacks: "default"`, beta header `server-side-fallback-2026-07-01`). It calls the Messages API with `fetch` rather than the SDK, so the Worker has no dependencies and the tests can mock `fetch`.

## Configuration

Plain vars live in `wrangler.toml` under `[vars]`:

| Var | Default | Purpose |
|---|---|---|
| `AUTO_SEND` | `"false"` | `"true"` sends replies to leads; `"false"` emails every draft to Ian |
| `FROM_EMAIL` | `Ian Harman <ian@atomandbits.com>` | Sender (must be on a Resend-verified domain) |
| `REPLY_TO` | `Ian@atomandbits.com` | Reply-To on emails to leads |
| `IAN_EMAIL` | `Ian@atomandbits.com` | Where drafts, holds, and briefs go; BCC on auto-sent replies |
| `BOOKING_URL` | empty | Scheduling link included in replies (for example a Cal.com page) |
| `ALLOWED_ORIGINS` | see above | Comma list; a trailing `:*` allows any port |
| `CLAUDE_MODEL` | `claude-sonnet-5` | Model ID |
| `CLAUDE_EFFORT` | `medium` | `low` to `max` |
| `CLAUDE_TIMEOUT_MS` | `22000` | Abort the model call after this; a timeout takes the hold path |
| `RATE_LIMIT_PER_HOUR` | `5` | Accepted inquiries per IP per hour |

Secrets (set with `wrangler secret put`, never in the repo):

| Secret | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Claude API key |
| `RESEND_API_KEY` | yes, to send email | Without it, emails are only logged (metadata, no content) |
| `IBRAIN_WEBHOOK_URL` | optional | iBrain endpoint for records |
| `IBRAIN_WEBHOOK_SECRET` | with the URL | HMAC key for `X-Signature` |
| `HERMES_WEBHOOK_URL` | optional | Hermes endpoint for records |
| `HERMES_WEBHOOK_SECRET` | with the URL | HMAC key for Hermes' `X-Signature` |
| `CAL_WEBHOOK_SECRET` | for `/cal-webhook` | Cal.com webhook secret; the route returns `503` without it |
| `TURNSTILE_SECRET` | optional | When set, `/inquiry` requires a valid Turnstile token |

```sh
cd agents/inbound
npx wrangler login                       # or export CLOUDFLARE_API_TOKEN
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put IBRAIN_WEBHOOK_URL
npx wrangler secret put IBRAIN_WEBHOOK_SECRET   # e.g. from: openssl rand -hex 32
npx wrangler secret put CAL_WEBHOOK_SECRET
# optional: HERMES_WEBHOOK_URL, HERMES_WEBHOOK_SECRET, TURNSTILE_SECRET
npx wrangler deploy
```

For local runs, copy `.dev.vars.example` to `.dev.vars` (git-ignored), fill it in, and run `npx wrangler dev`. Point the site's `INBOUND_ENDPOINT` at `http://127.0.0.1:8787/inquiry` while serving the site with `python3 -m http.server 4173 --bind 127.0.0.1`.

### Rate limiting

A fixed one-hour window per `CF-Connecting-IP`. Without a KV binding, counts live in the Worker isolate's memory, which is best effort: Cloudflare runs many isolates, so a determined sender can exceed the limit. For a shared count, create a KV namespace (`npx wrangler kv namespace create RATE_LIMIT`) and uncomment the `[[kv_namespaces]]` block in `wrangler.toml`. KV is eventually consistent, so the limit is approximate either way; Turnstile is the stronger bot defense.

### Turnstile

Create a Turnstile widget for atomandbits.com in the Cloudflare dashboard, put the site key in the contact page's widget, and set `TURNSTILE_SECRET`. The site must then send the widget's token in the JSON body as `cf-turnstile-response` (or `turnstile`).

## Deploy

`.github/workflows/inbound-agent.yml` runs `node --test` on pull requests and pushes that touch `agents/inbound/**`, and deploys with `cloudflare/wrangler-action` on `main` when `CLOUDFLARE_API_TOKEN` is available. It uses the `inbound-agent-production` GitHub environment: add the `CLOUDFLARE_API_TOKEN` secret there (a token with **Workers Scripts: Edit**, plus **Workers Routes: Edit** if you enable the custom domain) and make sure the `CLOUDFLARE_ACCOUNT_ID` variable is visible to it (repository-level, or on the environment). Worker secrets set with `wrangler secret put` persist across deploys.

The Worker is served at `https://atomandbits-inbound.<your-subdomain>.workers.dev`. To use `inbound.atomandbits.com`, the atomandbits.com zone must be on Cloudflare; then uncomment `routes` in `wrangler.toml`.

The GitHub Pages workflow publishes the whole repository, including this folder. That is harmless: there are no secrets here, only code, tests, and the voice guide.

## Resend: verify atomandbits.com

1. Create a Resend account and, under **Domains**, add `atomandbits.com` (Resend suggests a sending subdomain such as `send.atomandbits.com` for the return path).
2. Add the DNS records Resend shows at the atomandbits.com DNS host: the DKIM `TXT` record (`resend._domainkey`), and the SPF `TXT` and `MX` records on the return-path subdomain. If atomandbits.com already has SPF or DMARC for Google Workspace or another sender, keep those; Resend's records sit on the subdomain.
3. Add a DMARC record if there is none, starting with `v=DMARC1; p=none; rua=mailto:Ian@atomandbits.com`.
4. Click **Verify** in Resend and wait for every record to show verified.
5. Create an API key with **Sending access** for that domain and store it with `npx wrangler secret put RESEND_API_KEY`.

To use another provider, add a factory beside `resendMailer` in `src/email.mjs` that returns `{ name, send({ to, subject, text, html, replyTo, bcc }) }` and select it in `createMailer`.

## Cal.com webhook

1. In Cal.com, open **Settings → Developer → Webhooks → New** (or the webhook tab on the 30-minute event type).
2. Subscriber URL: `https://<worker host>/cal-webhook`.
3. Event triggers: **Booking Created**, **Booking Rescheduled**, **Booking Cancelled**.
4. Secret: generate one (`openssl rand -hex 32`), paste it into Cal.com, and store the same value with `npx wrangler secret put CAL_WEBHOOK_SECRET`.
5. Leave the payload template at the default. Save; Cal.com's test ping should get `200`.
6. Set `BOOKING_URL` in `wrangler.toml` to the event's public link so replies include it, and set the same link as `BOOKING_URL` in `site.js`.

For `BOOKING_CREATED`, Claude writes a private brief for Ian from the booking and its form answers only (no web lookups): who they are, three questions to explore, what they may be missing, and which offer might fit. The attendee's email address is not sent to the model. Reschedules and cancellations are only recorded to the webhooks, since Cal.com already notifies Ian of those.

## Hermes/iBrain webhook

Each processed inquiry or booking is sent as `POST` with `Content-Type: application/json` and these headers:

- `X-Signature`: lowercase hex HMAC-SHA256 of the raw request body, keyed with that endpoint's secret
- `X-Event`: `inquiry` or `booking`
- `X-Record-Id`: the record id (the same `id` the form received)

Inquiry record:

```json
{
  "type": "inquiry",
  "id": "5d0c…",
  "received_at": "2026-09-23T15:00:00.000Z",
  "completed_at": "2026-09-23T15:00:09.412Z",
  "source": "atomandbits.com/contact",
  "inquiry": { "name": "", "email": "", "organization": "", "topic": "", "timeline": "", "goal": "", "obstacle": "", "page": "" },
  "draft": { "subject": "", "body_text": "" },
  "flags": { "phi_detected": false, "spam": false, "needs_ian": false, "sentiment": "positive", "reasons": [] },
  "action": "draft_to_ian | held_draft_to_ian | auto_sent | held_ack_sent | dropped_spam",
  "auto_send": false,
  "email": { "provider": "resend", "lead_message_id": null, "ian_message_id": "…" },
  "model": { "id": "claude-sonnet-5", "usage": { "input_tokens": 0, "output_tokens": 0 } }
}
```

`draft` is `null` and `model` is `{ "error": "…" }` when the model call failed. Booking records have `type: "booking"`, `trigger`, `booking` (uid, title, event_type, start/end time, attendee, additional_notes, responses, cancellation_reason), `brief` (or `null`), `action` (`brief_sent`, `brief_failed_notice_sent`, `recorded`), `email`, and `error`.

Records contain whatever the sender wrote, which can include health information when `flags.phi_detected` is true. Store them accordingly. Delivery is fire-and-forget: a failed webhook is logged, not retried.

Verify the signature before trusting a record (Node):

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(rawBody, signatureHeader, secret) {
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const given = Buffer.from(signatureHeader || '', 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}
```

Python:

```python
import hashlib, hmac

def verify(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header or "")
```

Always compute the HMAC over the raw bytes as received, before parsing the JSON.

## Turning on AUTO_SEND

1. Leave `AUTO_SEND = "false"` for the first few weeks. Every draft arrives in Ian's inbox as `[Draft ready]` or `[Hold: …]`.
2. For each draft, send it as is, edit it, or rewrite it. Where Ian edits, change `voice.md` (tone, facts, offers) or the rules in `src/prompt.mjs`, and let the tests run on the pull request.
3. When a run of drafts would have gone out unedited, and the holds were the right calls, set `AUTO_SEND = "true"` in `wrangler.toml` and merge to `main` (or change it in the Cloudflare dashboard for a quick test; the next deploy restores `wrangler.toml`).
4. After that, clean replies go straight to the lead with Ian in BCC, and holds send the short acknowledgement while Ian answers personally. Flip it back to `"false"` at any time.

## Limits and notes

- The form response returns before any drafting. Work after the response runs in `ctx.waitUntil`, which Cloudflare allows to continue for about 30 seconds. The model call aborts at `CLAUDE_TIMEOUT_MS` (22 s by default) and falls to the hold path, leaving time for the emails and webhooks. If drafts ever need longer, move the processing to a Cloudflare Queue consumer.
- Logs record ids, actions, and flags, never message content.
- There is no retry for failed emails or webhooks; the record's `flags.reasons` and the Worker logs show failures.

## Tests

```sh
cd agents/inbound
node --test
```

No install needed (Node 22+). `fetch` is mocked for Anthropic, Resend, Turnstile, and the webhooks. The tests cover the honeypot, validation, CORS, rate limiting, Turnstile, webhook signatures, the PHI and needs-Ian hold paths, model errors, spam, draft backstops, draft-only mode, auto-send, and Cal.com signatures and events.

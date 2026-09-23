import { test } from 'node:test';
import assert from 'node:assert/strict';
import { call, send, env, mockFetch, goodDraft, inquiryBody } from './helpers.mjs';
import { hmacHex } from '../src/webhooks.mjs';
import { isAllowedOrigin, validateInquiry } from '../src/guard.mjs';
import { draftProblems, withSignature, looksLikePhi } from '../src/inquiry.mjs';
import { SIGNATURE_LINE } from '../src/prompt.mjs';

test('health', async () => {
  const { res, data } = await call('/health', { method: 'GET' });
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.auto_send, false);
});

test('CORS: allowed origins, localhost ports, and rejects others', async () => {
  assert.ok(isAllowedOrigin('https://atomandbits.com'));
  assert.ok(isAllowedOrigin('http://127.0.0.1:4173'));
  assert.ok(isAllowedOrigin('http://127.0.0.1'));
  assert.ok(!isAllowedOrigin('http://127.0.0.1.evil.com'));
  assert.ok(!isAllowedOrigin('https://atomandbits.com.evil.com'));
  assert.ok(!isAllowedOrigin(null));

  const pre = await call('/inquiry', { method: 'OPTIONS', headers: { origin: 'http://127.0.0.1:4173' } });
  assert.equal(pre.res.status, 204);
  assert.equal(pre.res.headers.get('access-control-allow-origin'), 'http://127.0.0.1:4173');

  const bad = await call('/inquiry', { body: inquiryBody(), headers: { origin: 'https://evil.example' } });
  assert.equal(bad.res.status, 403);
  assert.equal(bad.res.headers.get('access-control-allow-origin'), null);
});

test('honeypot: accepted and silently dropped', async () => {
  const m = mockFetch();
  const { res, data } = await call('/inquiry', { body: inquiryBody({ website: 'http://spam.example' }) });
  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.ok(data.id);
  assert.equal(m.calls.length, 0);
});

test('validation: required fields, email, lengths, types', async () => {
  mockFetch();
  for (const [override, error] of [
    [{ name: '' }, 'missing_name'],
    [{ email: 'not-an-email' }, 'invalid_email'],
    [{ goal: '   ' }, 'missing_goal'],
    [{ goal: 'x'.repeat(3001) }, 'goal_too_long'],
    [{ topic: ['a'] }, 'invalid_topic'],
  ]) {
    const { res, data } = await call('/inquiry', { body: inquiryBody(override) });
    assert.equal(res.status, 400, error);
    assert.deepEqual(data, { ok: false, error });
  }
  assert.equal((await call('/inquiry', { body: '{nope' })).res.status, 400);
  assert.equal((await call('/inquiry', { body: inquiryBody(), headers: { 'content-type': 'text/plain' } })).res.status, 415);
  assert.equal(validateInquiry(inquiryBody({ name: '  Dana\u0000 ' })).inquiry.name, 'Dana');
});

test('rate limit: per IP per hour', async () => {
  mockFetch();
  const e = env({ RATE_LIMIT_PER_HOUR: '2' });
  const headers = { 'cf-connecting-ip': '203.0.113.9' };
  await call('/inquiry', { body: inquiryBody(), headers, e }); // resets state, 1st
  assert.equal((await send('/inquiry', { body: inquiryBody(), headers, e })).res.status, 200);
  const third = await send('/inquiry', { body: inquiryBody(), headers, e });
  assert.equal(third.res.status, 429);
  assert.equal(third.data.error, 'rate_limited');
});

test('turnstile: required when TURNSTILE_SECRET is set', async () => {
  mockFetch();
  const { res, data } = await call('/inquiry', { body: inquiryBody({ turnstile: 'bad' }), e: env({ TURNSTILE_SECRET: 's' }) });
  assert.equal(res.status, 400);
  assert.equal(data.error, 'turnstile_failed');
});

test('AUTO_SEND false: draft emailed to Ian, nothing to the lead, record signed to iBrain', async () => {
  const m = mockFetch();
  const { res, data, results } = await call('/inquiry', { body: inquiryBody() });
  assert.equal(res.status, 200);
  assert.equal(results[0].action, 'draft_to_ian');

  const req = m.anthropic()[0].json;
  assert.equal(req.model, 'claude-sonnet-5');
  assert.equal(req.system.at(-1).cache_control.type, 'ephemeral');
  assert.equal(req.output_config.format.type, 'json_schema');
  assert.ok(!req.messages[0].content.includes('dana@riverbend.example'), 'lead email is not sent to the model');

  const emails = m.emails();
  assert.equal(emails.length, 1);
  assert.deepEqual(emails[0].json.to, ['ian@example.com']);
  assert.deepEqual(emails[0].json.reply_to, 'dana@riverbend.example');
  assert.match(emails[0].json.subject, /^\[Draft ready\]/);
  assert.match(emails[0].json.text, new RegExp(SIGNATURE_LINE));
  assert.match(emails[0].json.html, /href="mailto:dana%40riverbend.example\?subject=/);

  const hook = m.hooks()[0];
  assert.equal(hook.headers['x-signature'], await hmacHex('ibrain-secret', hook.body));
  assert.equal(hook.json.id, data.id);
  assert.equal(hook.json.action, 'draft_to_ian');
  assert.equal(hook.json.draft.subject, goodDraft().subject);
});

test('AUTO_SEND true: reply goes to the lead with Ian in BCC', async () => {
  const m = mockFetch();
  const { results } = await call('/inquiry', { body: inquiryBody(), e: env({ AUTO_SEND: 'true', REPLY_TO: 'Ian@atomandbits.com' }) });
  assert.equal(results[0].action, 'auto_sent');
  const [email] = m.emails();
  assert.deepEqual(email.json.to, ['dana@riverbend.example']);
  assert.deepEqual(email.json.bcc, ['ian@example.com']);
  assert.equal(email.json.reply_to, 'Ian@atomandbits.com');
  assert.equal(email.json.from, 'Ian Harman <ian@atomandbits.com>');
  assert.ok(email.json.text.endsWith(`Ian\n\n${SIGNATURE_LINE}`));
});

test('PHI flagged by the model: hold, acknowledgement to lead, alert to Ian', async () => {
  const m = mockFetch({ draft: goodDraft({ phi_detected: true }) });
  const { results } = await call('/inquiry', { body: inquiryBody(), e: env({ AUTO_SEND: 'true' }) });
  assert.equal(results[0].action, 'held_ack_sent');
  const [ack, alert] = m.emails();
  assert.deepEqual(ack.json.to, ['dana@riverbend.example']);
  assert.match(ack.json.text, /I'll reply personally shortly/);
  assert.match(ack.json.text, /leave patient details out/);
  assert.ok(!ack.json.text.includes('Riverbend'));
  assert.deepEqual(alert.json.to, ['ian@example.com']);
  assert.match(alert.json.subject, /Hold.*PHI/);
});

test('PHI caught by the regex backstop even if the model misses it', async () => {
  assert.ok(looksLikePhi('Her DOB is 1/2/1980'));
  assert.ok(looksLikePhi('member ID: ABC123456'));
  assert.ok(!looksLikePhi('We see about 40 clients a week, mostly Medicaid.'));
  mockFetch();
  const { results } = await call('/inquiry', { body: inquiryBody({ obstacle: 'Patient SSN 123-45-6789 keeps failing' }), e: env({ AUTO_SEND: 'true' }) });
  assert.equal(results[0].action, 'held_ack_sent');
});

test('needs_ian and model errors hold; AUTO_SEND false sends nothing to the lead', async () => {
  let m = mockFetch({ draft: goodDraft({ needs_ian: true, needs_ian_reason: 'press request' }) });
  let { results } = await call('/inquiry', { body: inquiryBody() });
  assert.equal(results[0].action, 'held_draft_to_ian');
  assert.equal(m.emails().length, 1);
  assert.deepEqual(m.emails()[0].json.to, ['ian@example.com']);

  m = mockFetch({ anthropicStatus: 529 });
  ({ results } = await call('/inquiry', { body: inquiryBody(), e: env({ AUTO_SEND: 'true' }) }));
  assert.equal(results[0].action, 'held_ack_sent');
  assert.equal(results[0].draft, null);
  assert.match(results[0].flags.reasons[0], /model error/);
  assert.equal(m.emails().length, 2);
});

test('spam: dropped, no email, still recorded', async () => {
  const m = mockFetch({ draft: goodDraft({ spam: true }) });
  const { results } = await call('/inquiry', { body: inquiryBody(), e: env({ AUTO_SEND: 'true' }) });
  assert.equal(results[0].action, 'dropped_spam');
  assert.equal(m.emails().length, 0);
  assert.equal(m.hooks().length, 1);
});

test('draft backstops: prices and foreign links force a hold', async () => {
  assert.deepEqual(draftProblems('Happy to talk. https://atomandbits.com/contact/.', ''), []);
  assert.equal(draftProblems('It costs $5,000.', '').length, 1);
  assert.equal(draftProblems('See https://evil.example/x', '').length, 1);
  assert.deepEqual(draftProblems('Book at https://cal.com/ian/30min', 'https://cal.com/ian'), []);
  assert.equal(withSignature('Hi,\n\nThanks.'), `Hi,\n\nThanks.\n\nIan\n\n${SIGNATURE_LINE}`);

  const m = mockFetch({ draft: goodDraft({ body_text: 'Hi Dana, click https://evil.example\n\nIan' }) });
  const { results } = await call('/inquiry', { body: inquiryBody(), e: env({ AUTO_SEND: 'true' }) });
  assert.equal(results[0].action, 'held_ack_sent');
  assert.ok(!m.emails()[0].json.text.includes('evil.example'));
});

test('Hermes webhook is signed with its own secret when set', async () => {
  const m = mockFetch();
  await call('/inquiry', { body: inquiryBody(), e: env({ HERMES_WEBHOOK_URL: 'https://hermes.test/in', HERMES_WEBHOOK_SECRET: 'h' }) });
  const hermes = m.calls.find((c) => c.url.startsWith('https://hermes.test'));
  assert.equal(hermes.headers['x-signature'], await hmacHex('h', hermes.body));
});

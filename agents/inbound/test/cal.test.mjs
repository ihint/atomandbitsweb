import { test } from 'node:test';
import assert from 'node:assert/strict';
import { call, env, mockFetch } from './helpers.mjs';
import { hmacHex, verifyHmacHex } from '../src/webhooks.mjs';

const booking = (trigger = 'BOOKING_CREATED') => JSON.stringify({
  triggerEvent: trigger,
  createdAt: '2026-09-23T15:00:00Z',
  payload: {
    uid: 'bk_1', title: '30 min with Ian', startTime: '2026-09-30T15:00:00Z', endTime: '2026-09-30T15:30:00Z',
    attendees: [{ name: 'Dana Smith', email: 'dana@riverbend.example', timeZone: 'America/New_York' }],
    responses: { name: { label: 'Your name', value: 'Dana Smith' }, email: { value: 'dana@riverbend.example' }, notes: { label: 'What should we cover?', value: 'Taking insurance.' } },
  },
});

const signed = async (raw, secret = 'cal-secret') => ({ 'x-cal-signature-256': await hmacHex(secret, raw) });

test('HMAC verify accepts only the right secret and body', async () => {
  const sig = await hmacHex('k', 'body');
  assert.ok(await verifyHmacHex('k', 'body', sig));
  assert.ok(await verifyHmacHex('k', 'body', `sha256=${sig}`));
  assert.ok(!(await verifyHmacHex('k', 'body2', sig)));
  assert.ok(!(await verifyHmacHex('other', 'body', sig)));
  assert.ok(!(await verifyHmacHex('k', 'body', 'zz')));
});

test('cal webhook: bad or missing signature is rejected', async () => {
  const m = mockFetch();
  const raw = booking();
  assert.equal((await call('/cal-webhook', { body: raw })).res.status, 401);
  assert.equal((await call('/cal-webhook', { body: raw, headers: await signed(raw, 'wrong') })).res.status, 401);
  assert.equal((await call('/cal-webhook', { body: raw, headers: await signed(raw), e: env({ CAL_WEBHOOK_SECRET: '' }) })).res.status, 503);
  assert.equal(m.calls.length, 0);
});

test('cal webhook: BOOKING_CREATED briefs Ian and records to iBrain', async () => {
  const m = mockFetch();
  const raw = booking();
  const { res, results } = await call('/cal-webhook', { body: raw, headers: await signed(raw) });
  assert.equal(res.status, 200);
  assert.equal(results[0].action, 'brief_sent');
  assert.ok(!m.anthropic()[0].body.includes('dana@riverbend.example'), 'attendee email is not sent to the model');
  const [email] = m.emails();
  assert.deepEqual(email.json.to, ['ian@example.com']);
  assert.match(email.json.subject, /Pre-call brief\] Dana Smith · 2026-09-30/);
  assert.match(email.json.text, /1\. Q1\?/);
  const hook = m.hooks()[0];
  assert.equal(hook.json.type, 'booking');
  assert.equal(hook.headers['x-signature'], await hmacHex('ibrain-secret', hook.body));
});

test('cal webhook: reschedule/cancel are recorded without a brief; pings are acknowledged', async () => {
  const m = mockFetch();
  for (const trigger of ['BOOKING_RESCHEDULED', 'BOOKING_CANCELLED']) {
    const raw = booking(trigger);
    const { results } = await call('/cal-webhook', { body: raw, headers: await signed(raw) });
    assert.equal(results[0].action, 'recorded');
  }
  assert.equal(m.anthropic().length, 0);
  assert.equal(m.emails().length, 0);
  assert.equal(m.hooks().length, 2);

  const ping = JSON.stringify({ triggerEvent: 'PING', payload: {} });
  const { data } = await call('/cal-webhook', { body: ping, headers: await signed(ping) });
  assert.equal(data.ignored, 'PING');
});

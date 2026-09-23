import { readFileSync } from 'node:fs';
import { handle } from '../src/app.mjs';
import { _resetMemoryRateLimit } from '../src/guard.mjs';

export const voice = readFileSync(new URL('../voice.md', import.meta.url), 'utf8');
export const ORIGIN = 'https://atomandbits.com';

export function env(overrides = {}) {
  return {
    ANTHROPIC_API_KEY: 'test-anthropic',
    RESEND_API_KEY: 'test-resend',
    IBRAIN_WEBHOOK_URL: 'https://ibrain.test/hook',
    IBRAIN_WEBHOOK_SECRET: 'ibrain-secret',
    CAL_WEBHOOK_SECRET: 'cal-secret',
    AUTO_SEND: 'false',
    IAN_EMAIL: 'ian@example.com',
    ...overrides,
  };
}

// Replaces globalThis.fetch with a router; records every call.
export function mockFetch({ draft = goodDraft(), anthropicStatus = 200, brief = goodBrief() } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    const body = typeof init.body === 'string' ? init.body : null;
    calls.push({ url: String(url), headers: init.headers || {}, body, json: body ? JSON.parse(body) : null });
    if (String(url).startsWith('https://api.anthropic.com')) {
      const isBrief = body.includes('pre-call brief');
      const data = isBrief ? brief : draft;
      return Response.json(
        anthropicStatus === 200
          ? { model: 'claude-sonnet-5', stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify(data) }], usage: { input_tokens: 10, output_tokens: 10 } }
          : { type: 'error', error: { type: 'overloaded_error' } },
        { status: anthropicStatus },
      );
    }
    if (String(url).startsWith('https://api.resend.com')) return Response.json({ id: `email_${calls.length}` });
    if (String(url).includes('turnstile')) return Response.json({ success: false });
    return new Response(null, { status: 204 });
  };
  const of = (prefix) => calls.filter((c) => c.url.startsWith(prefix));
  return { calls, anthropic: () => of('https://api.anthropic.com'), emails: () => of('https://api.resend.com'), hooks: () => of('https://ibrain.test') };
}

export function goodDraft(overrides = {}) {
  return {
    subject: 'Re: taking insurance at Riverbend',
    body_text: 'Hi Dana,\n\nThanks for writing. Who answers when a caller asks about insurance today?\n\nIan',
    phi_detected: false, spam: false, needs_ian: false, needs_ian_reason: '', sentiment: 'positive',
    ...overrides,
  };
}

export function goodBrief() {
  return { who_they_are: 'A practice owner.', questions: ['Q1?', 'Q2?', 'Q3?'], what_they_may_be_missing: 'Payer mix.', fit: 'Claims Native' };
}

export function inquiryBody(overrides = {}) {
  return {
    name: 'Dana Smith', email: 'dana@riverbend.example', organization: 'Riverbend Counseling', topic: 'Deciding whether to accept insurance',
    timeline: 'This quarter', goal: 'Offer insurance to the patients who keep asking.', obstacle: 'Nobody owns billing.',
    page: '/contact/', website: '', ...overrides,
  };
}

export async function call(path, { method = 'POST', body, headers = {}, e = env() } = {}) {
  _resetMemoryRateLimit();
  return send(path, { method, body, headers, e });
}

// Like call() but keeps rate-limit state between requests.
export async function send(path, { method = 'POST', body, headers = {}, e = env() } = {}) {
  const pending = [];
  const ctx = { waitUntil: (p) => pending.push(p) };
  const init = { method, headers: { origin: ORIGIN, 'content-type': 'application/json', ...headers } };
  if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);
  const res = await handle(new Request(`https://inbound.test${path}`, init), e, ctx, { voice });
  const results = await Promise.all(pending);
  return { res, data: res.status === 204 ? null : await res.json(), results };
}

// Routing. Handlers answer fast; drafting, email, and webhooks run in ctx.waitUntil.
import { isAllowedOrigin, corsHeaders, validateInquiry, checkRateLimit, verifyTurnstile, DEFAULT_ORIGINS } from './guard.mjs';
import { verifyHmacHex } from './webhooks.mjs';
import { processInquiry } from './inquiry.mjs';
import { processBooking, CAL_EVENTS } from './cal.mjs';

const MAX_BODY = 16 * 1024;

const json = (status, data, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } });

export async function handle(request, env, ctx, { voice }) {
  const url = new URL(request.url);
  if (url.pathname === '/health' && request.method === 'GET') {
    return json(200, { ok: true, service: 'atomandbits-inbound', auto_send: String(env.AUTO_SEND).toLowerCase() === 'true' });
  }
  if (url.pathname === '/inquiry') return handleInquiry(request, env, ctx, voice);
  if (url.pathname === '/cal-webhook' && request.method === 'POST') return handleCal(request, env, ctx, voice);
  return json(404, { ok: false, error: 'not_found' });
}

async function readBody(request) {
  const text = await request.text();
  return text.length > MAX_BODY ? null : text;
}

async function handleInquiry(request, env, ctx, voice) {
  const origin = request.headers.get('origin');
  if (!isAllowedOrigin(origin, env.ALLOWED_ORIGINS || DEFAULT_ORIGINS)) {
    return json(403, { ok: false, error: 'origin_not_allowed' });
  }
  const cors = corsHeaders(origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' }, cors);
  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return json(415, { ok: false, error: 'expected_json' }, cors);
  }

  const raw = await readBody(request);
  if (raw === null) return json(413, { ok: false, error: 'too_large' }, cors);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_json' }, cors);
  }

  const id = crypto.randomUUID();
  // Honeypot: bots fill the hidden "website" field. Pretend success, do nothing.
  if (typeof body?.website === 'string' && body.website.trim() !== '') return json(200, { ok: true, id }, cors);

  const { inquiry, error } = validateInquiry(body);
  if (error) return json(400, { ok: false, error }, cors);

  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!(await checkRateLimit(env, ip))) return json(429, { ok: false, error: 'rate_limited' }, cors);

  if (env.TURNSTILE_SECRET) {
    const token = body['cf-turnstile-response'] || body.turnstile;
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET, token, ip))) return json(400, { ok: false, error: 'turnstile_failed' }, cors);
  }

  const receivedAt = new Date().toISOString();
  ctx.waitUntil(
    processInquiry({ env, voice, id, inquiry, receivedAt }).catch((err) =>
      console.log(JSON.stringify({ msg: 'inquiry processing failed', id, error: err.message })),
    ),
  );
  return json(200, { ok: true, id }, cors);
}

async function handleCal(request, env, ctx, voice) {
  const raw = await readBody(request);
  if (raw === null) return json(413, { ok: false, error: 'too_large' });
  if (!env.CAL_WEBHOOK_SECRET) return json(503, { ok: false, error: 'not_configured' });
  if (!(await verifyHmacHex(env.CAL_WEBHOOK_SECRET, raw, request.headers.get('x-cal-signature-256')))) {
    return json(401, { ok: false, error: 'bad_signature' });
  }
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }
  const id = crypto.randomUUID();
  const trigger = event.triggerEvent;
  // Acknowledge pings and events we don't handle so Cal.com doesn't retry them.
  if (!CAL_EVENTS.includes(trigger)) return json(200, { ok: true, id, ignored: trigger || 'unknown' });

  const receivedAt = new Date().toISOString();
  ctx.waitUntil(
    processBooking({ env, voice, id, trigger, payload: event.payload, receivedAt }).catch((err) =>
      console.log(JSON.stringify({ msg: 'booking processing failed', id, error: err.message })),
    ),
  );
  return json(200, { ok: true, id });
}

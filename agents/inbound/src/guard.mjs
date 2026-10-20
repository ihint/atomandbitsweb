// Request guards: CORS, validation, rate limiting, Turnstile.

export const DEFAULT_ORIGINS = 'https://atomandbits.com,https://www.atomandbits.com,http://127.0.0.1:*,http://localhost:*';

// Entries are exact origins; a trailing ":*" matches any port on that host.
export function isAllowedOrigin(origin, list = DEFAULT_ORIGINS) {
  if (!origin) return false;
  return list.split(',').map((s) => s.trim()).filter(Boolean).some((allowed) =>
    allowed.endsWith(':*') ? new RegExp(`^${escapeRe(allowed.slice(0, -2))}(:\\d{1,5})?$`).test(origin) : origin === allowed,
  );
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function corsHeaders(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

const LIMITS = { name: 120, email: 254, organization: 160, topic: 80, timeline: 40, goal: 3000, obstacle: 3000, page: 300 };
const REQUIRED = ['name', 'email', 'goal'];
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;

// Returns { inquiry } or { error }.
export function validateInquiry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'invalid_body' };
  const inquiry = {};
  for (const [field, max] of Object.entries(LIMITS)) {
    const raw = body[field];
    if (raw != null && typeof raw !== 'string') return { error: `invalid_${field}` };
    // Strip control characters (keep newlines and tabs) and trim.
    const value = (raw || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
    if (value.length > max) return { error: `${field}_too_long` };
    inquiry[field] = value;
  }
  for (const field of REQUIRED) if (!inquiry[field]) return { error: `missing_${field}` };
  if (!EMAIL_RE.test(inquiry.email)) return { error: 'invalid_email' };
  if (/[\r\n]/.test(inquiry.name + inquiry.email)) return { error: 'invalid_name' };
  return { inquiry };
}

// Fixed one-hour window per IP. Uses the RATE_LIMIT KV namespace when bound
// (shared across Cloudflare locations, eventually consistent); otherwise a
// per-isolate in-memory map, which is best effort only.
const memory = new Map();
export async function checkRateLimit(env, ip, now = Date.now()) {
  const limit = Number(env.RATE_LIMIT_PER_HOUR || 5);
  const key = `rl:${ip || 'unknown'}:${Math.floor(now / 3600000)}`;
  if (env.RATE_LIMIT) {
    const count = Number((await env.RATE_LIMIT.get(key)) || 0);
    if (count >= limit) return false;
    await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 3900 });
    return true;
  }
  if (memory.size > 5000) memory.clear();
  const count = memory.get(key) || 0;
  if (count >= limit) return false;
  memory.set(key, count + 1);
  return true;
}
export const _resetMemoryRateLimit = () => memory.clear();

export async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

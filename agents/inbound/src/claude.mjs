// Minimal Claude Messages API client over fetch (no SDK, so the Worker has no
// dependencies and tests can mock globalThis.fetch).
import { replySystem, briefSystem, REPLY_SCHEMA, BRIEF_SCHEMA, replyUserMessage, briefUserMessage } from './prompt.mjs';

const API_URL = 'https://api.anthropic.com/v1/messages';
export const DEFAULT_MODEL = 'claude-sonnet-5';

// Returns { ok: true, data, model, usage } or { ok: false, error }.
export async function callClaude(env, { system, user, schema, timeoutMs }) {
  if (!env.ANTHROPIC_API_KEY) return { ok: false, error: 'ANTHROPIC_API_KEY is not set' };
  const body = {
    model: env.CLAUDE_MODEL || DEFAULT_MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: env.CLAUDE_EFFORT || 'medium', format: { type: 'json_schema', schema } },
    // If a safety classifier declines, re-run on Anthropic's recommended fallback model.
    fallbacks: 'default',
    system,
    messages: [{ role: 'user', content: user }],
  };
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs ?? Number(env.CLAUDE_TIMEOUT_MS || 22000)),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: `anthropic ${res.status}: ${json?.error?.type || 'error'}` };
    if (json.stop_reason !== 'end_turn') return { ok: false, error: `stop_reason ${json.stop_reason}` };
    const text = (json.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    return { ok: true, data: JSON.parse(text), model: json.model, usage: json.usage };
  } catch (err) {
    return { ok: false, error: `anthropic request failed: ${err.name === 'TimeoutError' ? 'timeout' : err.message}` };
  }
}

export function draftReply(env, voice, inquiry) {
  return callClaude(env, {
    system: replySystem(voice),
    user: replyUserMessage(inquiry, { bookingUrl: env.BOOKING_URL }),
    schema: REPLY_SCHEMA,
  });
}

export function draftBrief(env, voice, booking) {
  return callClaude(env, { system: briefSystem(voice), user: briefUserMessage(booking), schema: BRIEF_SCHEMA });
}

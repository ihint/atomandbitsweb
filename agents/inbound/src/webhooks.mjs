// Signed outbound webhooks (iBrain / Hermes) and inbound signature checks (Cal.com).
const enc = new TextEncoder();

function hmacKey(secret, usage) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}

export async function hmacHex(secret, body) {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret, 'sign'), enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time check (crypto.subtle.verify) of a hex HMAC-SHA256 signature.
// Accepts an optional "sha256=" prefix.
export async function verifyHmacHex(secret, body, signature) {
  if (!secret || !signature) return false;
  const hex = String(signature).trim().replace(/^sha256=/i, '');
  if (!/^[0-9a-f]{64}$/i.test(hex)) return false;
  const bytes = new Uint8Array(hex.match(/../g).map((h) => parseInt(h, 16)));
  return crypto.subtle.verify('HMAC', await hmacKey(secret, 'verify'), bytes, enc.encode(body));
}

// POST the record to each configured personal-system webhook. Failures are
// logged and swallowed so one down endpoint never blocks email or the others.
export async function forwardRecord(env, record) {
  const targets = [
    ['ibrain', env.IBRAIN_WEBHOOK_URL, env.IBRAIN_WEBHOOK_SECRET],
    ['hermes', env.HERMES_WEBHOOK_URL, env.HERMES_WEBHOOK_SECRET],
  ].filter(([, url]) => url);
  const body = JSON.stringify(record);
  const results = await Promise.all(
    targets.map(async ([name, url, secret]) => {
      try {
        const headers = { 'content-type': 'application/json', 'x-event': record.type, 'x-record-id': record.id };
        if (secret) headers['x-signature'] = await hmacHex(secret, body);
        const res = await fetch(url, { method: 'POST', headers, body });
        return [name, res.status];
      } catch (err) {
        return [name, `error: ${err.message}`];
      }
    }),
  );
  for (const [name, status] of results) {
    if (status !== 200 && status !== 201 && status !== 202 && status !== 204) {
      console.log(JSON.stringify({ msg: 'webhook failed', target: name, status, id: record.id }));
    }
  }
  return Object.fromEntries(results);
}

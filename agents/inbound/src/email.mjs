// Email provider behind a tiny interface: mailer.send({ to, subject, text, html?, replyTo?, bcc? }).
// To swap providers, add another factory that returns the same shape and pick it in createMailer.

export const DEFAULT_FROM = 'Ian Harman <ian@atomandbits.com>';
export const DEFAULT_REPLY_TO = 'Ian@atomandbits.com';

export function createMailer(env) {
  if (env.RESEND_API_KEY) return resendMailer(env);
  return logMailer();
}

function resendMailer(env) {
  return {
    name: 'resend',
    async send({ to, subject, text, html, replyTo, bcc }) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: env.FROM_EMAIL || DEFAULT_FROM,
          to: [to],
          subject,
          text,
          ...(html && { html }),
          reply_to: replyTo || env.REPLY_TO || DEFAULT_REPLY_TO,
          ...(bcc && { bcc: [bcc] }),
        }),
      });
      if (!res.ok) throw new Error(`resend ${res.status}`);
      const json = await res.json().catch(() => ({}));
      return { id: json.id };
    },
  };
}

// Used when no provider key is configured (local dev): logs metadata, never content.
function logMailer() {
  return {
    name: 'log',
    async send({ to, subject }) {
      console.log(JSON.stringify({ msg: 'email not sent (no RESEND_API_KEY)', to: to.replace(/^.*@/, '*@'), subject }));
      return { id: null };
    },
  };
}

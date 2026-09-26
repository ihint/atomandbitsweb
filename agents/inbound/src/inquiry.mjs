// What happens after the form gets its 200: draft, decide, email, record.
import { draftReply } from './claude.mjs';
import { SIGNATURE_LINE } from './prompt.mjs';
import { createMailer, DEFAULT_REPLY_TO } from './email.mjs';
import { forwardRecord } from './webhooks.mjs';

// Deterministic backstop for obvious identifiers; the model catches the rest.
const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b(dob|date of birth|born on)\b/i,
  /\b(member|subscriber|policy|medicaid|medicare|mrn|medical record)\s*(id|#|number|no\.?)\s*[:#]?\s*[a-z0-9-]{5,}/i,
];
export const looksLikePhi = (text) => PHI_PATTERNS.some((re) => re.test(text));

const ALLOWED_LINK = /^https:\/\/(www\.)?(atomandbits\.com|claimsnative\.com)(\/|$)/i;

// Checks the model's draft against rules that code can enforce. Returns reasons to hold.
export function draftProblems(body, bookingUrl) {
  const problems = [];
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words > 260) problems.push(`draft too long (${words} words)`);
  if (/\$\s?\d|\b\d+\s?(k|usd|dollars)\b/i.test(body)) problems.push('draft mentions a price');
  for (const url of body.match(/https?:\/\/[^\s)>\]]+/gi) || []) {
    const clean = url.replace(/[.,;:!?]+$/, '');
    if (!ALLOWED_LINK.test(clean) && !(bookingUrl && clean.startsWith(bookingUrl))) problems.push(`draft links to ${clean}`);
  }
  return problems;
}

export function withSignature(body) {
  const trimmed = body.trim().replace(new RegExp(`\\s*${SIGNATURE_LINE.replace(/[.;]/g, '\\$&')}$`), '');
  return `${/\n\s*Ian\s*$/.test(trimmed) ? trimmed : `${trimmed}\n\nIan`}\n\n${SIGNATURE_LINE}`;
}

const firstName = (name) => (name.split(/\s+/)[0] || 'there').replace(/[^\p{L}'-]/gu, '') || 'there';

export function holdingAck(inquiry, { phi }) {
  const lines = [`Hi ${firstName(inquiry.name)},`, '', "Thanks for your note. I'll reply personally shortly."];
  if (phi) lines.push('', 'One small ask: please leave patient details out of email. Counts and rough ranges are plenty for a first conversation.');
  lines.push('', 'Ian', '', 'Ian Harman · Atom & Bits', 'Ian@atomandbits.com');
  return { subject: 'Thanks for writing', text: lines.join('\n') };
}

export function decide({ ok, flags, autoSend }) {
  if (ok && flags.spam) return 'dropped_spam';
  const hold = !ok || flags.phi_detected || flags.needs_ian;
  if (!autoSend) return hold ? 'held_draft_to_ian' : 'draft_to_ian';
  return hold ? 'held_ack_sent' : 'auto_sent';
}

export async function processInquiry({ env, voice, id, inquiry, receivedAt, mailer = createMailer(env) }) {
  const autoSend = String(env.AUTO_SEND).toLowerCase() === 'true';
  const ianEmail = env.IAN_EMAIL || DEFAULT_REPLY_TO;
  const result = await draftReply(env, voice, inquiry);

  const reasons = [];
  let draft = null;
  const flags = { phi_detected: false, spam: false, needs_ian: false, sentiment: 'neutral' };
  if (result.ok) {
    const d = result.data;
    Object.assign(flags, { phi_detected: d.phi_detected, spam: d.spam, needs_ian: d.needs_ian, sentiment: d.sentiment });
    if (d.needs_ian_reason) reasons.push(d.needs_ian_reason);
    draft = { subject: d.subject.slice(0, 150), body_text: withSignature(d.body_text) };
    const problems = draftProblems(d.body_text, env.BOOKING_URL);
    if (problems.length) {
      flags.needs_ian = true;
      reasons.push(...problems);
    }
  } else {
    reasons.push(`model error: ${result.error}`);
  }
  if (looksLikePhi(`${inquiry.goal}\n${inquiry.obstacle}\n${inquiry.organization}`)) flags.phi_detected = true;

  const action = decide({ ok: result.ok, flags, autoSend });
  const sent = {};
  try {
    if (action === 'auto_sent') {
      sent.lead = await mailer.send({
        to: inquiry.email, subject: draft.subject, text: draft.body_text,
        replyTo: env.REPLY_TO || DEFAULT_REPLY_TO, bcc: ianEmail,
      });
    } else if (action === 'held_ack_sent') {
      const ack = holdingAck(inquiry, { phi: flags.phi_detected });
      sent.lead = await mailer.send({ to: inquiry.email, subject: ack.subject, text: ack.text, replyTo: env.REPLY_TO || DEFAULT_REPLY_TO });
    }
    if (action !== 'dropped_spam' && action !== 'auto_sent') {
      sent.ian = await mailer.send(buildIanEmail(ianEmail, { id, inquiry, draft, flags, reasons, action }));
    }
  } catch (err) {
    reasons.push(`email error: ${err.message}`);
  }

  const record = {
    type: 'inquiry',
    id,
    received_at: receivedAt,
    completed_at: new Date().toISOString(),
    source: 'atomandbits.com/contact',
    inquiry,
    draft,
    flags: { ...flags, reasons },
    action,
    auto_send: autoSend,
    email: { provider: mailer.name, lead_message_id: sent.lead?.id ?? null, ian_message_id: sent.ian?.id ?? null },
    model: result.ok ? { id: result.model, usage: result.usage } : { error: result.error },
  };
  await forwardRecord(env, record);
  console.log(JSON.stringify({ msg: 'inquiry processed', id, action, flags: { ...flags }, reasons: reasons.length }));
  return record;
}

const LABELS = {
  draft_to_ian: 'Draft ready',
  held_draft_to_ian: 'Hold',
  held_ack_sent: 'Hold (acknowledgement sent)',
};

// The email Ian gets: the inquiry, the flags, the draft, and a one-click mailto
// that opens a reply to the lead with the draft prefilled. Reply-To is the lead.
function buildIanEmail(to, { id, inquiry, draft, flags, reasons, action }) {
  const why = [flags.phi_detected && 'PHI', flags.needs_ian && 'needs Ian', !draft && 'no draft'].filter(Boolean).join(', ');
  const subject = `[${LABELS[action]}${why ? `: ${why}` : ''}] ${inquiry.name}${inquiry.organization ? ` · ${inquiry.organization}` : ''}`;
  const summary = [
    `From: ${inquiry.name} <${inquiry.email}>`,
    inquiry.organization ? `Organization: ${inquiry.organization}` : null,
    inquiry.topic ? `Topic: ${inquiry.topic}` : null,
    inquiry.timeline ? `Timeline: ${inquiry.timeline}` : null,
    inquiry.page ? `Page: ${inquiry.page}` : null,
    `Sentiment: ${flags.sentiment}`,
    reasons.length ? `Notes: ${reasons.join('; ')}` : null,
    '',
    'What they are trying to make possible:',
    inquiry.goal,
    '',
    "What's in the way:",
    inquiry.obstacle || '(blank)',
  ].filter((line) => line !== null).join('\n');
  const draftText = draft ? `Subject: ${draft.subject}\n\n${draft.body_text}` : '(no draft; the model call failed)';
  const text = `${summary}\n\n---- Draft reply ----\n${draftText}\n\n----\nReply to this email to answer ${inquiry.email} directly. Record ${id}.`;

  let html = `<pre style="white-space:pre-wrap;font:14px/1.5 Georgia,serif">${escapeHtml(text)}</pre>`;
  if (draft) {
    const mailto = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body_text)}`;
    html = `<p><a href="${escapeHtml(mailto)}" style="font:600 15px sans-serif">Open this reply to ${escapeHtml(inquiry.name)} in my email app</a></p>${html}`;
  }
  return { to, subject, text, html, replyTo: inquiry.email };
}

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

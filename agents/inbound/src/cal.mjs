// Cal.com booking webhooks: brief Ian before new calls and record every change.
import { draftBrief } from './claude.mjs';
import { createMailer, DEFAULT_REPLY_TO } from './email.mjs';
import { forwardRecord } from './webhooks.mjs';

export const CAL_EVENTS = ['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED'];

// Keep only the fields the brief and the record need.
export function summarizeBooking(payload = {}) {
  const attendee = payload.attendees?.[0] || {};
  const responses = {};
  for (const [key, value] of Object.entries(payload.responses || {})) {
    const v = value && typeof value === 'object' && 'value' in value ? value.value : value;
    if (v != null && v !== '' && !['email', 'location', 'guests'].includes(key)) responses[value?.label || key] = v;
  }
  return {
    uid: payload.uid ?? null,
    title: payload.title ?? null,
    event_type: payload.type ?? payload.eventTypeSlug ?? null,
    start_time: payload.startTime ?? null,
    end_time: payload.endTime ?? null,
    attendee: { name: attendee.name ?? null, email: attendee.email ?? null, time_zone: attendee.timeZone ?? null },
    additional_notes: payload.additionalNotes || payload.description || null,
    responses,
    cancellation_reason: payload.cancellationReason ?? null,
  };
}

export async function processBooking({ env, voice, id, trigger, payload, receivedAt, mailer = createMailer(env) }) {
  const booking = summarizeBooking(payload);
  let brief = null;
  let error = null;
  let sent = null;

  if (trigger === 'BOOKING_CREATED') {
    const { email: _omit, ...attendeeForModel } = booking.attendee;
    const result = await draftBrief(env, voice, { ...booking, attendee: attendeeForModel });
    if (result.ok) brief = result.data;
    else error = result.error;
    try {
      sent = await mailer.send(briefEmail(env.IAN_EMAIL || DEFAULT_REPLY_TO, booking, brief, error));
    } catch (err) {
      error = [error, `email error: ${err.message}`].filter(Boolean).join('; ');
    }
  }

  const record = {
    type: 'booking',
    id,
    received_at: receivedAt,
    completed_at: new Date().toISOString(),
    source: 'cal.com',
    trigger,
    booking,
    brief,
    action: trigger === 'BOOKING_CREATED' ? (brief ? 'brief_sent' : 'brief_failed_notice_sent') : 'recorded',
    email: { provider: mailer.name, ian_message_id: sent?.id ?? null },
    error,
  };
  await forwardRecord(env, record);
  console.log(JSON.stringify({ msg: 'booking processed', id, trigger, action: record.action }));
  return record;
}

function briefEmail(to, booking, brief, error) {
  const who = booking.attendee.name || booking.attendee.email || 'Someone';
  const when = booking.start_time ? new Date(booking.start_time).toUTCString() : 'time not given';
  const lines = [`${who} booked "${booking.title || 'a call'}" for ${when}.`, ''];
  if (brief) {
    lines.push('Who they are', brief.who_they_are, '', 'Questions to explore');
    brief.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    lines.push('', 'What they may be missing', brief.what_they_may_be_missing, '', `Fit: ${brief.fit}`);
  } else {
    lines.push(`No brief this time (${error}).`);
  }
  lines.push('', 'What they wrote', JSON.stringify(booking.responses, null, 2));
  if (booking.additional_notes) lines.push('', `Notes: ${booking.additional_notes}`);
  return { to, subject: `[Pre-call brief] ${who}${booking.start_time ? ` · ${booking.start_time.slice(0, 10)}` : ''}`, text: lines.join('\n'), replyTo: booking.attendee.email || undefined };
}

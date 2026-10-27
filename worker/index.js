// Serves atomandbits.com from Cloudflare. The pages are static files served
// through the ASSETS binding; this Worker runs only for /api/* and emails each
// contact form message to Ian through the EMAIL binding. www.atomandbits.com
// is redirected by its own Worker in www-redirect/.

export const TOPICS = {
    billing: 'Insurance billing for my practice',
    company: 'Building or growing a company',
    'regulated-ai': 'AI in financial services or another regulated business',
    other: 'Something else',
};

const MAX_LENGTH = { name: 200, email: 254, company: 200, message: 5000 };
// The longest valid form is about 23 KB even with four-byte characters;
// anything bigger is refused before it is parsed.
const MAX_BODY_BYTES = 64 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK = 'Your message did not go through. Please email Ian@atomandbits.com instead.';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname === '/api/contact') return handleContact(request, env);
        return env.ASSETS.fetch(request);
    },
};

export async function handleContact(request, env) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
    }
    if (!sameOrigin(request)) {
        return respond(request, 403, 'This form only accepts messages sent from atomandbits.com.');
    }

    const body = await readLimited(request);
    if (!body) {
        return respond(request, 413, 'Your message is too long. Please shorten it or email Ian@atomandbits.com.');
    }
    let form;
    try {
        form = await new Response(body, { headers: { 'Content-Type': request.headers.get('Content-Type') || '' } }).formData();
    } catch (error) {
        return respond(request, 400, 'The form could not be read. Please try again.');
    }
    const value = (name) => String(form.get(name) ?? '').trim();

    // People never see the "website" field; automated spam fills it in.
    // Answer as if it worked so the sender learns nothing.
    if (value('website')) return respond(request, 200);

    const entry = {
        name: oneLine(value('name')),
        email: value('email'),
        company: oneLine(value('company')),
        topic: TOPICS[value('topic')] || '',
        message: value('message'),
    };
    const problem = validate(entry);
    if (problem) return respond(request, 400, problem);

    try {
        // The binding's destination_address refuses any other recipient.
        await env.EMAIL.send({
            to: env.CONTACT_TO,
            from: { email: env.CONTACT_FROM, name: 'atomandbits.com' },
            replyTo: { email: entry.email, name: entry.name },
            subject: subjectFor(entry),
            text: bodyFor(entry),
        });
    } catch (error) {
        console.error('contact email failed', error?.code, error?.message);
        return respond(request, 502, FALLBACK);
    }
    return respond(request, 200);
}

// Reads the body up to MAX_BODY_BYTES, trusting neither a missing nor a
// false Content-Length. Returns null when the body is too large.
async function readLimited(request) {
    if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) return null;
    if (!request.body) return new Blob([]);
    const reader = request.body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) return new Blob(chunks);
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
            await reader.cancel();
            return null;
        }
        chunks.push(value);
    }
}

function sameOrigin(request) {
    const origin = request.headers.get('Origin');
    if (!origin) return true;
    try {
        return new URL(origin).host === new URL(request.url).host;
    } catch (error) {
        return false;
    }
}

function oneLine(text) {
    return text.replace(/[\r\n]+/g, ' ');
}

export function validate(entry) {
    if (!entry.name) return 'Please add your name.';
    if (!entry.email || !EMAIL_PATTERN.test(entry.email)) return 'Please add an email address I can reply to.';
    if (!entry.message) return 'Please tell me a little about what’s on your mind.';
    for (const [field, limit] of Object.entries(MAX_LENGTH)) {
        if (entry[field].length > limit) return `Please shorten the ${field} field to ${limit} characters.`;
    }
    return '';
}

function subjectFor(entry) {
    const who = entry.company ? `${entry.name} (${entry.company})` : entry.name;
    return `Website message from ${who}`.slice(0, 200);
}

function bodyFor(entry) {
    return [
        `Name: ${entry.name}`,
        `Email: ${entry.email}`,
        `Company: ${entry.company || '—'}`,
        `Working on: ${entry.topic || '—'}`,
        '',
        'What’s on your mind?',
        entry.message,
        '',
        'Sent from the contact form on atomandbits.com. Reply to this email to answer.',
    ].join('\n');
}

// The page's script asks for JSON. A browser without JavaScript posts the
// form directly, so it gets a page back instead.
function respond(request, status, error = '') {
    const ok = status === 200;
    if ((request.headers.get('Accept') || '').includes('application/json')) {
        return Response.json({ ok, error: ok ? undefined : error }, { status });
    }
    if (ok) return Response.redirect(new URL('/contact/thanks/', request.url).toString(), 303);
    const page = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Message not sent · Atom &amp; Bits</title><link rel="stylesheet" href="/site.css"></head>
<body><main><h1>Your message wasn’t sent.</h1><p>${escapeHtml(error)}</p>
<p><a href="/contact/">Back to the form</a> · <a href="mailto:Ian@atomandbits.com">Ian@atomandbits.com</a></p></main></body></html>`;
    return new Response(page, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

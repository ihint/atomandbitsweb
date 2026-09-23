// ---------------------------------------------------------------------------
// Site configuration. Ian supplies these values; empty strings keep them off.
//
// ANALYTICS.provider: '' (off) or 'posthog'. ANALYTICS.key: the PostHog
// project API key. PostHog loads only when both are set, with in-memory
// persistence, no cookies, and autocapture off. If Plausible is added to a
// page by its own script tag instead, track() sends events there.
//
// BOOKING_URL: a scheduling link (for example a Calendly or Cal.com page).
// When set, every [data-booking-link] element is pointed at it and shown.
// ---------------------------------------------------------------------------
const ANALYTICS = { provider: '', key: '' };
const ANALYTICS_HOST = 'https://us.i.posthog.com';
const BOOKING_URL = '';

// Load PostHog only when it has been configured.
if (ANALYTICS.provider === 'posthog' && ANALYTICS.key) {
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify alias people.set people.set_once set_config get_distinct_id".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    window.posthog.init(ANALYTICS.key, {
        api_host: ANALYTICS_HOST,
        persistence: 'memory',
        disable_persistence: true,
        autocapture: false,
        capture_pageview: true,
        disable_session_recording: true,
    });
}

// Send an event to whichever analytics tool is present; otherwise do nothing.
function track(eventName, props = {}) {
    try {
        if (window.posthog && typeof window.posthog.capture === 'function') {
            window.posthog.capture(eventName, props);
        } else if (typeof window.plausible === 'function') {
            window.plausible(eventName, { props });
        }
    } catch (error) {
        // Analytics must never interfere with the page.
    }
}
window.track = track;

// Any element with data-event reports a click, with the page and destination.
document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-event]') : null;
    if (!target) return;
    track(target.dataset.event, {
        path: window.location.pathname,
        href: target.getAttribute('href') || '',
    });
});

// Show booking links only once a scheduling URL exists.
if (BOOKING_URL) {
    document.querySelectorAll('[data-booking-link]').forEach((link) => {
        link.setAttribute('href', BOOKING_URL);
        link.hidden = false;
    });
}

// Native menu disclosure stays usable without JavaScript.
const mobileMenu = document.querySelector('.mobile-nav');
if (mobileMenu) {
    const summary = mobileMenu.querySelector('summary');
    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => { mobileMenu.open = false; });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenu.open) {
            mobileMenu.open = false;
            if (summary) summary.focus();
        }
    });
    document.addEventListener('click', (event) => {
        if (mobileMenu.open && !mobileMenu.contains(event.target)) {
            mobileMenu.open = false;
        }
    });
}

// This is a sample explanation, with no live workflow or external actions.
document.querySelectorAll('[data-walkthrough]').forEach((demo) => {
    const buttons = [...demo.querySelectorAll('[data-step]')];
    const panels = [...demo.querySelectorAll('[data-panel]')];
    if (!buttons.length || !panels.length) return;
    const show = (step) => {
        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.step === step));
        });
        panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== step; });
    };
    buttons.forEach((button) => {
        button.addEventListener('click', () => { show(button.dataset.step); });
    });
    show(buttons[0].dataset.step);
    demo.classList.add('enhanced');
});

// Contact form: there is no backend, so compose an email in the visitor's own app.
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
    const CONTACT_EMAIL = 'Ian@atomandbits.com';
    const topicSelect = contactForm.querySelector('[name="topic"]');
    const confirmation = document.querySelector('[data-form-confirmation]');
    const copyButton = document.querySelector('[data-copy-message]');
    const copyStatus = document.querySelector('[data-copy-status]');
    const messageCopy = document.querySelector('[data-message-copy]');
    const mailtoLink = document.querySelector('[data-mailto-link]');
    const topicNote = document.querySelector('[data-topic-note]');
    const topicLabelOut = document.querySelector('[data-topic-label]');
    let lastMessage = '';

    const labelFor = (value) => {
        const option = topicSelect ? [...topicSelect.options].find((item) => item.value === value && value) : null;
        return option ? option.textContent.trim() : 'Something else';
    };

    // Preselect a topic passed from another page, e.g. /contact/?topic=pilot.
    const requested = new URLSearchParams(window.location.search).get('topic');
    if (requested && topicSelect) {
        const known = [...topicSelect.options].some((item) => item.value === requested);
        topicSelect.value = known ? requested : 'other';
        if (topicNote && topicLabelOut) {
            topicLabelOut.textContent = labelFor(topicSelect.value);
            topicNote.hidden = false;
        }
    }

    const field = (name) => {
        const input = contactForm.querySelector(`[name="${name}"]`);
        return input ? input.value.trim() : '';
    };

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (typeof contactForm.reportValidity === 'function' && !contactForm.reportValidity()) return;

        const topic = field('topic');
        const topicLabel = labelFor(topic);
        const organization = field('organization');
        const subject = `${topicLabel} — ${organization || field('name') || 'New conversation'}`;
        lastMessage = [
            `Name: ${field('name')}`,
            `Email: ${field('email')}`,
            `Organization: ${organization || '—'}`,
            `Topic: ${topicLabel}`,
            `Timeline: ${field('timeline') || '—'}`,
            '',
            'What are you trying to make possible?',
            field('goal') || '—',
            '',
            'What’s in the way?',
            field('obstacle') || '—',
        ].join('\n');
        const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lastMessage)}`;

        track('contact_form_submit', { topic: topic || 'none', path: window.location.pathname });

        if (mailtoLink) mailtoLink.setAttribute('href', mailto);
        if (messageCopy) messageCopy.value = `To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${lastMessage}`;
        if (confirmation) {
            confirmation.hidden = false;
            confirmation.focus({ preventScroll: true });
            confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        window.location.href = mailto;
    });

    if (copyButton && messageCopy) {
        copyButton.addEventListener('click', async () => {
            const text = messageCopy.value;
            try {
                await navigator.clipboard.writeText(text);
                if (copyStatus) copyStatus.textContent = `Copied. Paste it into a new email to ${CONTACT_EMAIL}.`;
            } catch (error) {
                // Clipboard access can be blocked; show the text so it can be copied by hand.
                messageCopy.hidden = false;
                messageCopy.focus();
                messageCopy.select();
                if (copyStatus) copyStatus.textContent = 'Your message is selected below. Copy it and paste it into a new email.';
            }
        });
    }
}

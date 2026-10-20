// ---------------------------------------------------------------------------
// Site configuration. Ian supplies these values; empty strings keep them off.
//
// ANALYTICS.provider: '' (off) or 'posthog'. ANALYTICS.key: the PostHog
// project API key. PostHog loads only when both are set, with in-memory
// persistence, no cookies, and autocapture off. If Plausible is added to a
// page by its own script tag instead, track() sends events there.
// ---------------------------------------------------------------------------
const ANALYTICS = { provider: '', key: '' };
const ANALYTICS_HOST = 'https://us.i.posthog.com';

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

// Contact form: post to /api/contact, where the Worker emails Ian. Without
// JavaScript the form posts directly and the Worker returns a page instead.
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
    const FALLBACK = 'Your message did not go through. Please email Ian@atomandbits.com instead.';
    const topicSelect = contactForm.querySelector('[name="topic"]');
    const submitButton = contactForm.querySelector('[type="submit"]');
    const status = contactForm.querySelector('[data-form-status]');
    const confirmation = document.querySelector('[data-form-confirmation]');

    // Preselect a topic passed from another page, e.g. /contact/?topic=company.
    const requested = new URLSearchParams(window.location.search).get('topic');
    if (requested && topicSelect && [...topicSelect.options].some((option) => option.value === requested)) {
        topicSelect.value = requested;
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!contactForm.reportValidity()) return;
        submitButton.disabled = true;
        status.textContent = 'Sending…';

        let result = { ok: false, error: FALLBACK };
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' },
            });
            result = await response.json();
        } catch (error) {
            // A network failure or a host without the Worker keeps the fallback message.
        }

        if (result.ok) {
            track('contact_form_submit', { topic: (topicSelect && topicSelect.value) || 'none', path: window.location.pathname });
            contactForm.hidden = true;
            confirmation.hidden = false;
            confirmation.focus();
            return;
        }
        status.textContent = result.error || FALLBACK;
        submitButton.disabled = false;
    });
}

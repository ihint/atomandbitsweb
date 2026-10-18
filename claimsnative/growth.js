/* Public marketing events only. No SDK, autocapture, replay, identity or full URLs. */
(function (root, factory) {
  'use strict';
  var core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  else if (!root.ClaimsGrowth) root.ClaimsGrowth = core.start(root);
}(typeof window === 'object' ? window : this, function () {
  'use strict';
  var pages = {
    '/': 'home', '/how-we-start/': 'setup', '/chiropractors/': 'specialty',
    '/insurance-opportunity/': 'calculator', '/keep-your-ehr/': 'guide',
    '/billing-setup/': 'guide', '/remittance-and-deposits/': 'guide'
  };
  var events = ['primary_cta_clicked', 'inquiry_form_started', 'inquiry_draft_prepared', 'inquiry_email_opened', 'scheduling_link_clicked'];
  var ctas = ['get-started', 'how-it-works', 'talk-to-us', 'start-inquiry', 'review-draft', 'open-email', 'schedule'];
  var locations = ['header', 'hero', 'body', 'invitation', 'footer', 'form'];
  var sources = ['direct_unknown', 'google', 'bing', 'chatgpt', 'perplexity', 'claude', 'copilot', 'duckduckgo', 'newsletter', 'partner', 'other_referral'];
  var campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  function path(value) {
    var p = String(value).split(/[?#]/)[0].replace(/^\/claimsnative(?=\/|$)/, '') || '/';
    p = p.replace(/index\.html$/, '');
    if (p !== '/' && !p.endsWith('/')) p += '/';
    return Object.hasOwn(pages, p) ? p : null;
  }
  function campaign(input, registry) {
    var result = {};
    campaignKeys.forEach(function (key) {
      var value = input[key];
      if (typeof value === 'string' && /^[a-z0-9-]{1,40}$/.test(value) && (registry[key] || []).includes(value)) result[key] = value;
    });
    return result;
  }
  function source(referrer) {
    if (!referrer) return 'direct_unknown';
    try {
      var u = new URL(referrer);
      if (!['http:', 'https:'].includes(u.protocol)) return 'direct_unknown';
      var h = u.hostname.toLowerCase();
      if (['claimsnative.com', 'www.claimsnative.com', 'app.claimsnative.com'].includes(h)) return 'internal';
      var hosts = {'www.google.com':'google','google.com':'google','www.bing.com':'bing','bing.com':'bing','chatgpt.com':'chatgpt','chat.openai.com':'chatgpt','perplexity.ai':'perplexity','www.perplexity.ai':'perplexity','claude.ai':'claude','copilot.microsoft.com':'copilot','duckduckgo.com':'duckduckgo'};
      return hosts[h] || 'other_referral';
    } catch (_) { return 'direct_unknown'; }
  }
  function cleanTouch(input, registry) {
    var out = campaign(input || {}, registry);
    out.referral_source = sources.includes(input && input.referral_source) ? input.referral_source : 'direct_unknown';
    return out;
  }
  function touch(search, referrer, registry, previous) {
    var params = new URLSearchParams(search), raw = {};
    campaignKeys.forEach(function (k) { if (params.getAll(k).length === 1) raw[k] = params.get(k); });
    var out = campaign(raw, registry), referral = source(referrer);
    if (out.utm_source && sources.includes(out.utm_source)) referral = out.utm_source;
    if (!out.utm_source && referral === 'internal' && previous) return Object.assign(cleanTouch(previous, registry), out);
    out.referral_source = referral === 'internal' ? 'direct_unknown' : referral;
    return out;
  }
  function properties(event, input, registry) {
    if (!events.includes(event)) return null;
    var p = path(input.page_path);
    if (!p) return null;
    var out = {page_path:p, page_category:pages[p]};
    if (ctas.includes(input.cta_id)) out.cta_id = input.cta_id;
    if (locations.includes(input.cta_location)) out.cta_location = input.cta_location;
    ['first', 'conversion'].forEach(function (prefix) {
      var t = cleanTouch(input[prefix], registry);
      Object.keys(t).forEach(function (k) { out[prefix + '_' + k] = t[k]; });
    });
    return out;
  }
  function start(w) {
    var d = w.document, config = w.ClaimsGrowthConfig || {}, registry = config.campaigns || {};
    var p = path(w.location.pathname), key = 'claims-growth-v1', consentKey = 'claims-growth-choice-v1';
    var enabledHost = w.location.hostname === 'claimsnative.com';
    var allowedHost = ['https://us.i.posthog.com', 'https://eu.i.posthog.com'].includes(config.posthogHost);
    var configured = !!config.posthogKey && allowedHost;
    var optIn = false, stored = null, now = Date.now(), seen = new Set(), lastClicks = new Map();
    function read(k) { try { return w.sessionStorage.getItem(k); } catch (_) { return null; } }
    function save(k, v) { try { w.sessionStorage.setItem(k, v); } catch (_) { /* in-memory fallback */ } }
    function remove(k) { try { w.sessionStorage.removeItem(k); } catch (_) { /* no storage */ } }
    var blocked = w.navigator.globalPrivacyControl === true || w.navigator.doNotTrack === '1' || w.navigator.webdriver === true;
    if (p && enabledHost && configured && !blocked) optIn = read(consentKey) === 'yes';
    if (optIn) {
      try { stored = JSON.parse(read(key)); } catch (_) { /* invalid state */ }
      if (!stored || !Number.isFinite(stored.at) || now - stored.at > 1800000 || stored.at > now) stored = null;
    }
    var current = touch(w.location.search, d.referrer, registry, stored && stored.conversion);
    var first = stored ? cleanTouch(stored.first, registry) : current;
    function persist() { if (optIn) save(key, JSON.stringify({at:Date.now(), first:first, conversion:current})); }
    persist();
    function track(event, extra, once) {
      if (!p || !enabledHost || !configured || !optIn || blocked) return false;
      var props = properties(event, Object.assign({}, extra, {page_path:p, first:first, conversion:current}), registry);
      if (!props) return false;
      var marker = event + ':' + p + ':' + (props.cta_id || '') + ':' + (props.cta_location || '');
      if (once && seen.has(marker)) return false;
      if (!once && lastClicks.has(marker) && Date.now() - lastClicks.get(marker) < 1000) return false;
      if (!w.crypto || typeof w.crypto.randomUUID !== 'function') return false;
      var uuid = w.crypto.randomUUID();
      seen.add(marker); lastClicks.set(marker, Date.now());
      // One attempt only. The UUID is transport deduplication, never a visitor or lead ID.
      var payload = {api_key:config.posthogKey, event:event, uuid:uuid, distinct_id:'public-marketing', properties:Object.assign({ $process_person_profile:false, $geoip_disable:true, $ip:'0.0.0.0'}, props)};
      try {
        w.fetch(config.posthogHost + '/i/v0/e/', {method:'POST', mode:'cors', credentials:'omit', referrerPolicy:'no-referrer', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), keepalive:true}).catch(function () {});
      } catch (_) { /* collection never breaks the form */ }
      return true;
    }
    function leadLines() {
      var lines = [];
      var labels = {referral_source:'source', utm_source:'campaign source', utm_medium:'channel', utm_campaign:'campaign', utm_content:'link'};
      var values = {direct_unknown:'Direct or unknown', other_referral:'Other website', google:'Google', bing:'Bing', chatgpt:'ChatGPT', perplexity:'Perplexity', claude:'Claude', copilot:'Copilot', duckduckgo:'DuckDuckGo', newsletter:'Newsletter', partner:'Partner', organic:'Organic search', referral:'Referral', email:'Email', cpc:'Paid search', 'existing-ehr':'Keep your EHR', 'billing-setup':'Billing setup', 'payment-reconciliation':'Payment reconciliation', guide:'Guide', footer:'Footer', profile:'Profile'};
      ['first', 'conversion'].forEach(function (prefix) {
        var t = prefix === 'first' ? first : current;
        Object.keys(t).forEach(function (k) { lines.push((prefix === 'first' ? 'First observed ' : 'Current ') + labels[k] + ': ' + (values[t[k]] || t[k])); });
      });
      return lines;
    }
    function choose(yes) {
      optIn = yes && configured && enabledHost && !blocked;
      save(consentKey, optIn ? 'yes' : 'no');
      if (optIn) persist(); else remove(key); // Consent does not reset page-level retry protection.
      var panel = d.getElementById('growth-choice');
      if (panel) panel.hidden = true;
    }
    if (p) {
      d.addEventListener('input', function (e) {
        if (e.target.closest && e.target.closest('#review-form')) track('inquiry_form_started', {}, true);
      });
      d.addEventListener('click', function (e) {
        var el = e.target.closest && e.target.closest('[data-growth-event]');
        if (!el) return;
        track(el.dataset.growthEvent, {cta_id:el.dataset.growthCta, cta_location:el.dataset.growthLocation}, false);
        if (el.dataset.growthCta === 'talk-to-us') {
          // Only fixed public email links, never the generated form draft.
          var u = new URL(el.href);
          u.searchParams.set('body', 'I would like to discuss billing for my practice.\nPlease do not include patient information.\n\n' + leadLines().join('\n'));
          el.href = u.href;
        }
      });
      d.querySelectorAll('[data-growth-choice]').forEach(function (el) { el.addEventListener('click', function () { choose(el.dataset.growthChoice === 'yes'); }); });
      d.querySelectorAll('[data-growth-settings]').forEach(function (el) {
        el.hidden = !(enabledHost && configured);
        el.addEventListener('click', function () { d.getElementById('growth-choice').hidden = false; });
      });
      var panel = d.getElementById('growth-choice');
      if (panel) panel.hidden = !(enabledHost && configured && !read(consentKey) && !blocked);
    }
    return {track:track, leadLines:leadLines, choose:choose};
  }
  return {path:path, campaign:campaign, source:source, touch:touch, properties:properties, start:start};
}));

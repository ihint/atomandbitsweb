const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const site = path.join(__dirname, '../../claimsnative');
const html = fs.readFileSync(path.join(site, 'insurance-opportunity/index.html'), 'utf8');
const code = fs.readFileSync(path.join(site, 'calculator.js'), 'utf8');

function inquiry(reducedMotion = false, clipboard) {
  const ids = ['turned-away', 'frequency', 'course-revenue', 'monthly-potential', 'annual-potential', 'annual-patients', 'exact-formula', 'review-form', 'draft-review', 'draft-preview', 'draft-heading', 'draft-subject', 'copy-status', 'copy-address', 'copy-subject', 'copy-body', 'open-email', 'use-estimate', 'include-estimate', 'inquiry-fields', 'review-draft-button', 'practice-name', 'specialty', 'location', 'visits-week', 'practice-system', 'insurance-status', 'biggest-concern', 'contact-name', 'contact-email', 'heard-about'];
  const nodes = Object.fromEntries(ids.map(id => [id, {value:'', checked:false, hidden:id === 'draft-review', disabled:['inquiry-fields','review-draft-button'].includes(id), listeners:{}, addEventListener(name, fn) { this.listeners[name] = fn; }, focus() { document.activeElement = this; }, scrollIntoView(options) { this.scroll = options; }}]));
  Object.assign(nodes['turned-away'], {value:'2'});
  Object.assign(nodes.frequency, {value:'week'});
  Object.assign(nodes['course-revenue'], {value:'750'});
  const document = {getElementById: id => nodes[id], activeElement:null};
  const tracked = [];
  const window = {navigator:{clipboard}, matchMedia:() => ({matches:reducedMotion}), ClaimsGrowth:{leadLines:() => ['First visit source: Google'], track:(...args) => tracked.push(args)}};
  vm.runInNewContext(code, {document, window, Intl, Number, encodeURIComponent});
  nodes['contact-name'].value = 'Demo Contact';
  nodes['contact-email'].value = 'demo@example.test';
  nodes['biggest-concern'].value = 'Can you review our existing payment follow-up?';
  return {nodes, document, tracked, submit() { nodes['review-form'].listeners.submit({preventDefault(){}}); }, body() { return new URL(nodes['open-email'].href).searchParams.get('body'); }};
}

test('failed JavaScript leaves inquiry fields and submit disabled in the HTML', () => {
  assert.match(html, /<fieldset\b[^>]*\bid="inquiry-fields"[^>]*\bdisabled/);
  assert.match(html, /<button\b[^>]*\bid="review-draft-button"[^>]*\bdisabled/);
});

test('only name, email and question are required for a first inquiry', () => {
  const required = [...html.matchAll(/<(?:input|textarea|select)\b[^>]*\brequired[^>]*>/g)].map(m => m[0].match(/id="([^"]+)"/)[1]).sort();
  assert.deepEqual(required, ['biggest-concern', 'contact-email', 'contact-name']);
});

test('a billing question never includes untouched example revenue by default', () => {
  const e = inquiry(); e.submit();
  assert.match(e.body(), /existing payment follow-up/);
  assert.match(e.body(), /demo@example.test/);
  assert.match(e.body(), /First visit source: Google/);
  assert.doesNotMatch(e.body(), /ESTIMATE|6,500|78,000|undefined/);
  assert.equal(e.nodes['draft-review'].hidden, false);
  assert.equal(e.nodes['inquiry-fields'].disabled, false);
  assert.equal(e.nodes['review-draft-button'].disabled, false);
});

test('an explicitly included estimate uses the current calculator values', () => {
  const e = inquiry(); e.nodes['include-estimate'].checked = true;
  e.nodes['turned-away'].value = '3'; e.nodes.frequency.value = 'month'; e.nodes['course-revenue'].value = '100';
  e.submit(); assert.match(e.body(), /ESTIMATE/); assert.match(e.body(), /Monthly gross potential: \$300/);
  assert.match(e.body(), /Annual gross potential: \$3,600/);
});

test('optional practice details are included only when supplied', () => {
  const e = inquiry(); e.nodes['practice-system'].value = 'Demo EHR'; e.submit();
  assert.match(e.body(), /Practice system: Demo EHR/);
  assert.doesNotMatch(e.body(), /Visits per week:|City\/state:/);
});

test('Use this estimate opts in and clears an earlier draft', () => {
  const e = inquiry(); e.submit(); e.nodes['use-estimate'].listeners.click();
  assert.equal(e.nodes['include-estimate'].checked, true);
  assert.equal(e.nodes['draft-review'].hidden, true);
  e.submit(); assert.match(e.body(), /ESTIMATE/);
});

test('editing either the inquiry or calculator clears the stale draft and mailto body', () => {
  const e = inquiry();
  for (const node of ['review-form','turned-away']) {
    e.submit(); e.nodes[node].listeners.input();
    assert.equal(e.nodes['draft-review'].hidden, true);
    assert.equal(new URL(e.nodes['open-email'].href).searchParams.has('body'), false);
  }
});

test('draft review moves keyboard focus and respects reduced motion', () => {
  const e = inquiry(true); e.submit();
  assert.equal(e.document.activeElement, e.nodes['draft-heading']);
  assert.equal(e.nodes['draft-review'].scroll.behavior, 'auto');
  assert.match(html, /id="draft-heading"[^>]*tabindex="-1"/);
});

test('each guide offers an on-page inquiry before the email-app handoff', () => {
  for (const route of ['keep-your-ehr','billing-setup','remittance-and-deposits']) {
    const guide = fs.readFileSync(path.join(site, route, 'index.html'), 'utf8');
    assert.match(guide, /href="\/claimsnative\/insurance-opportunity\/#review"[^>]*data-growth-cta="start-inquiry"/);
    assert.match(guide, /email draft/);
  }
});

test('copy controls do nothing before a draft and copy each email part exactly', async () => {
  const copied = [];
  const e = inquiry(false, {writeText:async value => copied.push(value)});
  await e.nodes['copy-body'].listeners.click(); assert.equal(copied.length, 0);
  e.submit();
  for (const part of ['address','subject','body']) await e.nodes['copy-'+part].listeners.click();
  assert.deepEqual(copied, ['daniel@claimsnative.com', e.nodes['draft-subject'].textContent, e.body()]);
  assert.match(e.nodes['copy-status'].textContent, /Message copied.*Nothing has been sent/);
  assert.equal(e.tracked.length, 1); // Copy is neither a sent request nor a new event.
});

test('denied or missing clipboard keeps manual copy and never reports success', async () => {
  for (const clipboard of [undefined, {writeText:async () => {throw Error('denied');}}]) {
    const e = inquiry(false, clipboard); e.submit();
    await e.nodes['copy-body'].listeners.click();
    assert.match(e.nodes['copy-status'].textContent, /Copy is unavailable.*Nothing has been sent/);
    assert.equal(e.nodes['draft-review'].hidden, false);
    assert.match(e.nodes['draft-preview'].textContent, /existing payment follow-up/);
  }
});

test('editing, reset or a replacement draft cannot display stale copy confirmation', async () => {
  for (const action of ['input', 'reset', 'submit']) {
    let finish;
    const e = inquiry(false, {writeText:() => new Promise(resolve => {finish = resolve;})}); e.submit();
    const pending = e.nodes['copy-body'].listeners.click();
    if (action === 'submit') e.submit(); else e.nodes['review-form'].listeners[action]();
    finish(); await pending;
    assert.equal(e.nodes['copy-status'].textContent, '');
    if (action !== 'submit') {
      assert.equal(e.nodes['draft-review'].hidden, true);
      assert.equal(e.nodes['draft-subject'].textContent, '');
      assert.equal(new URL(e.nodes['open-email'].href).searchParams.has('body'), false);
    }
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const script = readFileSync(new URL("../claimsnative/signup-source.js", import.meta.url), "utf8");
const KEY = "claimsnative.signupSource";
const SIGNUP = "https://app.claimsnative.com/signup";
const DAY = 24 * 60 * 60 * 1000;

// Runs the page script against a fake page: its address, browser signals,
// storage and links. Returns the links' hrefs and what storage holds.
function run({ search = "", store = new Map(), navigator = {}, now = 1_800_000_000_000, storage = true,
               hrefs = [SIGNUP, "https://app.claimsnative.com/login", "/how-we-start/"] } = {}) {
  const links = hrefs.map((href) => ({ href }));
  const localStorage = {
    getItem(key) { if (!storage) throw new Error("storage off"); return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { if (!storage) throw new Error("storage off"); store.set(key, value); },
    removeItem(key) { if (!storage) throw new Error("storage off"); store.delete(key); },
  };
  const document = {
    querySelectorAll(selector) {
      assert.equal(selector, `a[href^="${SIGNUP}"]`);
      return links.filter((link) => link.href.startsWith(SIGNUP));
    },
  };
  vm.runInNewContext(script, {
    location: { search }, navigator, localStorage, document, URL, URLSearchParams,
    Date: { now: () => now },
  });
  return { hrefs: links.map((link) => link.href), store };
}

test("the address's ad tags go onto Get started links only", () => {
  const { hrefs, store } = run({ search: "?utm_source=x&utm_medium=paid_social&utm_content=ad-price&twclid=tw-1&email=a%40b.c" });
  assert.equal(hrefs[0], `${SIGNUP}?utm_source=x&utm_medium=paid_social&utm_content=ad-price&twclid=tw-1`);
  assert.deepEqual(hrefs.slice(1), ["https://app.claimsnative.com/login", "/how-we-start/"]);
  assert.deepEqual(JSON.parse(store.get(KEY)).tags,
    { utm_source: "x", utm_medium: "paid_social", utm_content: "ad-price", twclid: "tw-1" });
});

test("a later page uses the saved tags for 30 days, then forgets them", () => {
  const { store } = run({ search: "?utm_source=google&gclid=g-1" });
  assert.equal(run({ store, now: 1_800_000_000_000 + 29 * DAY }).hrefs[0], `${SIGNUP}?utm_source=google&gclid=g-1`);
  assert.equal(run({ store, now: 1_800_000_000_000 + 31 * DAY }).hrefs[0], SIGNUP);
  assert.equal(store.has(KEY), false);
});

test("new tags on the address replace the saved ones", () => {
  const { store } = run({ search: "?utm_source=google" });
  assert.equal(run({ search: "?utm_source=x", store }).hrefs[0], `${SIGNUP}?utm_source=x`);
  assert.equal(run({ store }).hrefs[0], `${SIGNUP}?utm_source=x`);
});

for (const navigator of [{ globalPrivacyControl: true }, { doNotTrack: "1" }]) {
  test(`a browser that sends ${Object.keys(navigator)[0]} keeps no tags`, () => {
    const { hrefs, store } = run({ search: "?utm_source=x&twclid=tw-1", navigator });
    assert.equal(hrefs[0], SIGNUP);
    assert.equal(store.size, 0);
  });
}

test("long, non-ASCII or control-character values are dropped", () => {
  const search = `?utm_source=${"x".repeat(201)}&utm_medium=caf%C3%A9&utm_campaign=a%0Ab&utm_content=+ok+`;
  assert.equal(run({ search }).hrefs[0], `${SIGNUP}?utm_content=ok`);
  assert.equal(run({ search: "?utm_source=&gclid=" }).hrefs[0], SIGNUP);
});

test("a link's own tags win, and storage that is off still tags this page", () => {
  const { hrefs } = run({ search: "?utm_source=x&utm_medium=social", storage: false,
                          hrefs: [`${SIGNUP}?utm_source=site`] });
  assert.equal(hrefs[0], `${SIGNUP}?utm_source=site&utm_medium=social`);
});

test("an unreadable saved value is ignored", () => {
  const store = new Map([[KEY, "{not json"]]);
  assert.equal(run({ store }).hrefs[0], SIGNUP);
});

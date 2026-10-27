import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../home.js', import.meta.url), 'utf8');
function setup({ reduced = false, contextAvailable = true } = {}) {
    const events = {}, frames = new Map(), attributes = {};
    let nextFrame = 1, observer, draws = 0;
    const media = { matches: reduced, addEventListener: (_, cb) => { events.reduce = cb; } };
    const toggle = { hidden: true, textContent: '', setAttribute: (key, value) => { attributes[key] = value; }, addEventListener: (_, cb) => { events.click = cb; } };
    const context = { clearRect() { draws++; }, setTransform() {}, beginPath() {}, arc() {}, fill() {} };
    const hero = { getBoundingClientRect: () => ({ width: 1280, height: 800 }) };
    const canvas = { getContext: () => contextAvailable ? context : null, closest: () => hero };
    const document = { hidden: false, getElementById: () => canvas, querySelector: () => toggle, addEventListener: (name, cb) => { events[name] = cb; } };
    runInNewContext(source, {
        document, window: { matchMedia: () => media, devicePixelRatio: 3, IntersectionObserver: true, addEventListener: (name, cb) => { events[name] = cb; } },
        requestAnimationFrame: cb => { const id = nextFrame++; frames.set(id, cb); return id; },
        cancelAnimationFrame: id => frames.delete(id),
        IntersectionObserver: class { constructor(cb) { observer = cb; } observe() {} },
    });
    return { events, frames, attributes, media, toggle, document, canvas, view: visible => observer([{ isIntersecting: visible }]), draws: () => draws,
        tick(time) { const [id, cb] = frames.entries().next().value; frames.delete(id); cb(time); } };
}

test('reduced motion draws a static scene without starting animation', () => {
    const env = setup({ reduced: true });
    assert.equal(env.frames.size, 0);
    assert.equal(env.toggle.hidden, true);
    assert.ok(env.draws() > 0);
    assert.equal(env.canvas.width, 2560);
});
test('pause and resume keep one loop and expose their state', () => {
    const env = setup();
    env.tick(10); env.tick(26);
    assert.equal(env.frames.size, 1);
    env.events.click();
    assert.equal(env.frames.size, 0);
    assert.equal(env.attributes['aria-pressed'], 'true');
    assert.equal(env.toggle.textContent, 'Resume motion');
    env.events.click();
    assert.equal(env.frames.size, 1);
    assert.equal(env.attributes['aria-pressed'], 'false');
});
test('offscreen and hidden tabs stop work; manual pause survives re-entry', () => {
    const env = setup();
    env.view(false); assert.equal(env.frames.size, 0);
    env.view(true); assert.equal(env.frames.size, 1);
    env.document.hidden = true; env.events.visibilitychange(); assert.equal(env.frames.size, 0);
    env.document.hidden = false; env.events.visibilitychange(); assert.equal(env.frames.size, 1);
    env.events.click(); env.view(false); env.view(true);
    assert.equal(env.frames.size, 0);
});
test('changing reduced motion takes effect immediately', () => {
    const env = setup();
    env.media.matches = true; env.events.reduce();
    assert.equal(env.frames.size, 0);
    assert.equal(env.toggle.hidden, true);
    env.media.matches = false; env.events.reduce();
    assert.equal(env.frames.size, 1);
    assert.equal(env.toggle.hidden, false);
});
test('a browser without canvas keeps the optional control hidden', () => {
    const env = setup({ contextAvailable: false });
    assert.equal(env.frames.size, 0);
    assert.equal(env.toggle.hidden, true);
});

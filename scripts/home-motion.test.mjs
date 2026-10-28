import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../home.js', import.meta.url), 'utf8');
function setup({ reduced = false, contextAvailable = true } = {}) {
    const events = {}, frames = new Map(), attributes = {};
    let nextFrame = 1, observer, draws = 0, time = 1, strokes = [], glows = [], start;
    const media = { matches: reduced, addEventListener: (_, cb) => { events.reduce = cb; } };
    const toggle = { hidden: true, textContent: '', setAttribute: (key, value) => { attributes[key] = value; }, addEventListener: (_, cb) => { events.click = cb; } };
    const context = { clearRect() { draws++; strokes = []; glows = []; }, setTransform() {}, beginPath() {}, arc() {}, fill() {},
        createRadialGradient(x, y, inner, outerX, outerY, radius) { const glow = { x, y, radius, addColorStop() {} }; glows.push(glow); return glow; },
        moveTo(x, y) { start = [x, y]; }, lineTo(x, y) { strokes.push({ a: start, b: [x, y], color: this.strokeStyle, width: this.lineWidth }); }, stroke() {} };
    const play = { hidden: true, classList: { toggle() {} }, getBoundingClientRect: () => ({ top: 650 }) };
    const trigger = { disabled: false, addEventListener: (_, cb) => { events.find = cb; } };
    const status = { textContent: '' };
    const hero = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 800 }), addEventListener: (name, cb) => { events[name] = cb; } };
    const canvas = { getContext: () => contextAvailable ? context : null, closest: () => hero };
    const document = { hidden: false, getElementById: id => id === 'product-field' ? canvas : status, querySelector: selector => ({ '.motion-toggle': toggle, '.swarm-play': play, '.swarm-trigger': trigger })[selector], addEventListener: (name, cb) => { events[name] = cb; } };
    runInNewContext(source, {
        document, window: { matchMedia: () => media, devicePixelRatio: 3, IntersectionObserver: true, addEventListener: (name, cb) => { events[name] = cb; } },
        requestAnimationFrame: cb => { const id = nextFrame++; frames.set(id, cb); return id; },
        cancelAnimationFrame: id => frames.delete(id),
        IntersectionObserver: class { constructor(cb) { observer = cb; } observe() {} },
    });
    return { events, frames, attributes, media, toggle, play, trigger, status, document, canvas, strokes: () => strokes, glows: () => glows, view: visible => observer([{ isIntersecting: visible }]), draws: () => draws,
        advance(seconds) { for (let i = 0; i < seconds * 60; i++) { time += 1000 / 60; this.tick(time); } },
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


test('tap or keyboard activation gathers a route and announces the result once', () => {
    const env = setup();
    assert.equal(env.play.hidden, false);
    env.events.find();
    assert.equal(env.status.textContent, 'Finding the connections…');
    env.advance(3);
    assert.equal(env.status.textContent, 'A way through. Want to try another?');
    const route = env.strokes().filter(s => s.width === 2);
    assert.ok(route.length >= 7, 'the route crosses the extra waypoint columns');
    for (let i = 1; i < route.length; i++) assert.deepEqual(route[i].a, route[i - 1].b);
    const end = route.at(-1).b;
    env.events.find(); env.advance(3);
    assert.notDeepEqual(env.strokes().filter(s => s.width === 2).at(-1).b, end);
    env.advance(10);
    assert.ok(env.strokes().filter(s => s.width === 2).length > 0, 'button result remains visible');
    assert.equal(env.frames.size, 1);
});

test('cursor chooses a destination; leaving returns the field to rest', () => {
    const env = setup();
    const point = (x, y) => ({ pointerType: 'mouse', clientX: x, clientY: y, target: { closest: () => null } });
    env.events.pointermove(point(1180, 250)); env.advance(3);
    const first = env.strokes().filter(s => s.width === 2).at(-1).b;
    env.events.pointermove(point(1180, 500)); env.advance(3);
    assert.notDeepEqual(env.strokes().filter(s => s.width === 2).at(-1).b, first);
    env.events.pointerleave(); env.advance(3);
    assert.equal(env.strokes().length, 0);
});

test('touch scrolling does not start a swarm and paused motion ignores pointer input', () => {
    const env = setup();
    env.events.pointermove({ pointerType: 'touch' }); env.advance(1);
    assert.equal(env.strokes().length, 0);
    env.events.click(); const count = env.draws();
    env.events.pointermove({ pointerType: 'mouse' }); env.events.find();
    assert.equal(env.draws(), count);
    assert.equal(env.frames.size, 0);
    assert.equal(env.trigger.disabled, true);
});

test('reduced motion permits a new static route without starting a loop', () => {
    const env = setup({ reduced: true });
    const first = env.strokes().filter(s => s.width === 2).at(-1).b;
    env.events.find();
    assert.notDeepEqual(env.strokes().filter(s => s.width === 2).at(-1).b, first);
    assert.equal(env.status.textContent, 'A way through. Want to try another?');
    assert.equal(env.frames.size, 0);
});


test('a paused visitor can still choose a static path after enabling reduced motion', () => {
    const env = setup(); env.events.click();
    env.media.matches = true; env.events.reduce();
    assert.equal(env.trigger.disabled, false);
    const first = env.strokes().filter(s => s.width === 2).at(-1).b;
    env.events.find();
    assert.notDeepEqual(env.strokes().filter(s => s.width === 2).at(-1).b, first);
    assert.equal(env.frames.size, 0);
});


test('arrival light waits for the final waypoint and resets for a new destination', () => {
    const env = setup(); env.events.find();
    env.advance(2);
    assert.equal(env.glows().length, 0, 'no arrival light while the route is traveling');
    env.advance(2);
    assert.equal(env.glows().length, 1);
    const glow = env.glows()[0], end = env.strokes().filter(s => s.width === 2).at(-1).b;
    assert.deepEqual([glow.x, glow.y], end, 'only the final dot receives the arrival glow');
    assert.ok(glow.radius > 30, 'arrival light is wider than the ordinary node halo');
    env.events.find(); env.advance(.1);
    assert.equal(env.glows().length, 0, 'a new target waits for its own arrival');
});

test('reduced motion shows the completed arrival light without animating', () => {
    const env = setup({ reduced: true });
    assert.equal(env.glows().length, 1);
    assert.equal(env.frames.size, 0);
    const first = [env.glows()[0].x, env.glows()[0].y];
    env.events.find();
    assert.notDeepEqual([env.glows()[0].x, env.glows()[0].y], first);
    assert.equal(env.frames.size, 0);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/index.js";

const ORIGIN = "https://atomandbits.com";

// A fake Cloudflare environment that records every email instead of sending it.
function environment({ failWith } = {}) {
  const sent = [];
  const assets = [];
  return {
    sent,
    assets,
    env: {
      CONTACT_TO: "Ian@atomandbits.com",
      CONTACT_FROM: "website@atomandbits.com",
      EMAIL: {
        async send(message) {
          if (failWith) throw Object.assign(new Error(failWith), { code: failWith });
          sent.push(message);
          return { messageId: "test" };
        },
      },
      ASSETS: {
        async fetch(request) {
          assets.push(new URL(request.url).pathname);
          return new Response("asset");
        },
      },
    },
  };
}

function post(fields, { json = true, origin = ORIGIN } = {}) {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  const headers = {};
  if (json) headers.Accept = "application/json";
  if (origin) headers.Origin = origin;
  return new Request(`${ORIGIN}/api/contact`, { method: "POST", body, headers });
}

const VALID = {
  name: "Dana Smith",
  email: "dana@example.com",
  company: "Smith Plastics",
  topic: "company",
  message: "Our intake runs on a spreadsheet.",
};

test("a complete message is emailed to Ian with the visitor as reply-to", async () => {
  const { env, sent } = environment();
  const response = await worker.fetch(post(VALID), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(sent.length, 1);
  const [message] = sent;
  assert.deepEqual(message.from, { email: "website@atomandbits.com", name: "atomandbits.com" });
  assert.deepEqual(message.replyTo, { email: "dana@example.com", name: "Dana Smith" });
  assert.equal(message.to, "Ian@atomandbits.com");
  assert.equal(message.subject, "Website message from Dana Smith (Smith Plastics)");
  assert.match(message.text, /Working on: Building or growing a company/);
  assert.match(message.text, /Our intake runs on a spreadsheet\./);
});

test("a browser without JavaScript is sent to the thank-you page", async () => {
  const { env, sent } = environment();
  const response = await worker.fetch(post(VALID, { json: false }), env);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("Location"), `${ORIGIN}/contact/thanks/`);
  assert.equal(sent.length, 1);
});

test("a filled-in hidden field looks accepted but sends nothing", async () => {
  const { env, sent } = environment();
  const response = await worker.fetch(post({ ...VALID, website: "http://spam.example" }), env);
  assert.equal(response.status, 200);
  assert.equal(sent.length, 0);
});

test("missing or malformed fields are refused with a reason", async () => {
  for (const [fields, reason] of [
    [{ ...VALID, name: " " }, /your name/],
    [{ ...VALID, email: "not-an-email" }, /email address/],
    [{ ...VALID, message: "" }, /what’s on your mind/],
    [{ ...VALID, message: "x".repeat(5001) }, /message field/],
  ]) {
    const { env, sent } = environment();
    const response = await worker.fetch(post(fields), env);
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, reason);
    assert.equal(sent.length, 0);
  }
});

test("line breaks in the name cannot reach the subject line", async () => {
  const { env, sent } = environment();
  await worker.fetch(post({ ...VALID, name: "Dana\r\nBcc: someone@example.com", company: "" }), env);
  assert.equal(sent[0].subject, "Website message from Dana Bcc: someone@example.com");
  assert.doesNotMatch(sent[0].subject, /[\r\n]/);
});

test("an unknown topic is left blank rather than echoed", async () => {
  const { env, sent } = environment();
  await worker.fetch(post({ ...VALID, topic: "<script>" }), env);
  assert.match(sent[0].text, /Working on: —/);
});

test("an oversized body is refused before it is parsed", async () => {
  const { env, sent } = environment();
  const response = await worker.fetch(post({ ...VALID, message: "x".repeat(70_000) }), env);
  assert.equal(response.status, 413);
  assert.match((await response.json()).error, /too long/);
  assert.equal(sent.length, 0);
});

test("a body streamed without Content-Length is still capped", async () => {
  const { env, sent } = environment();
  let pulls = 0;
  const endless = new ReadableStream({
    pull(controller) {
      pulls += 1;
      controller.enqueue(new Uint8Array(16 * 1024));
    },
  });
  const request = new Request(`${ORIGIN}/api/contact`, {
    method: "POST",
    body: endless,
    duplex: "half",
    headers: { Accept: "application/json", Origin: ORIGIN, "Content-Type": "multipart/form-data; boundary=x" },
  });
  const response = await worker.fetch(request, env);
  assert.equal(response.status, 413);
  assert.ok(pulls < 10, `read ${pulls} chunks before stopping`);
  assert.equal(sent.length, 0);
});

test("a declared Content-Length over the cap is refused without reading", async () => {
  const { env, sent } = environment();
  const request = new Request(`${ORIGIN}/api/contact`, {
    method: "POST",
    body: "name=x",
    headers: { Accept: "application/json", Origin: ORIGIN, "Content-Type": "application/x-www-form-urlencoded", "Content-Length": "1000000" },
  });
  const response = await worker.fetch(request, env);
  assert.equal(response.status, 413);
  assert.equal(sent.length, 0);
});

test("posts from another site are refused", async () => {
  const { env, sent } = environment();
  const response = await worker.fetch(post(VALID, { origin: "https://evil.example" }), env);
  assert.equal(response.status, 403);
  assert.equal(sent.length, 0);
});

test("a failed send tells the visitor to email Ian directly", async () => {
  const { env } = environment({ failWith: "E_DELIVERY_FAILED" });
  const response = await worker.fetch(post(VALID), env);
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /Ian@atomandbits\.com/);
});

test("the form endpoint accepts only POST", async () => {
  const { env } = environment();
  const response = await worker.fetch(new Request(`${ORIGIN}/api/contact`), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
});

test("every other path is served from the static files", async () => {
  const { env, assets } = environment();
  const response = await worker.fetch(new Request(`${ORIGIN}/how-i-work/`), env);
  assert.equal(await response.text(), "asset");
  assert.deepEqual(assets, ["/how-i-work/"]);
});

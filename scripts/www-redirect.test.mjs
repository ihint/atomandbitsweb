import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../www-redirect/src/index.mjs";

test("www is sent to the bare domain with its path and query", async () => {
  const response = await worker.fetch(new Request("https://www.atomandbits.com/how-i-work/?topic=company"));
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("Location"), "https://atomandbits.com/how-i-work/?topic=company");
});

test("plain http on www goes straight to https", async () => {
  const response = await worker.fetch(new Request("http://www.atomandbits.com/"));
  assert.equal(response.headers.get("Location"), "https://atomandbits.com/");
});

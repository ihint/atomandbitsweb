import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.mjs";

test("redirects www paths and queries to the canonical host", async () => {
  const response = await worker.fetch(
    new Request("https://www.claimsnative.com/90-day-pilot/?source=partner")
  );

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    "https://claimsnative.com/90-day-pilot/?source=partner"
  );
});

test("fails closed for a host outside the configured route", async () => {
  const response = await worker.fetch(
    new Request("https://example.com/90-day-pilot/")
  );

  assert.equal(response.status, 404);
  assert.equal(await response.text(), "Not found");
});

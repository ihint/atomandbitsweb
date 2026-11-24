import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { KEY, SITES, canonicalUrl, deployTarget, earlierSuccess, parseDiff, selectUrls, stepSucceeded } from "./indexnow.mjs";

const root = new URL("..", import.meta.url);
const read = (file) => readFileSync(new URL(file, root), "utf8");

test("both sites host the same IndexNow key at the web root", () => {
  for (const file of [`${KEY}.txt`, `claimsnative/${KEY}.txt`]) {
    assert.equal(read(file).trim(), KEY);
    assert.equal(file.endsWith(`/${KEY}.txt`) || file === `${KEY}.txt`, true);
  }
});

test("the atomandbits asset upload does not drop the key file", () => {
  const entries = read(".assetsignore").split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  const keyFile = `${KEY}.txt`;
  const dropped = entries.some((entry) => {
    if (entry.endsWith("/")) return keyFile.startsWith(entry);
    if (entry.endsWith("*")) return keyFile.startsWith(entry.slice(0, -1));
    return entry === keyFile;
  });
  assert.equal(dropped, false);
});

test("redirect rules do not capture the key file", () => {
  const keyPath = `/${KEY}.txt`;
  for (const file of ["_redirects", "claimsnative/cloudflare-pages/_redirects"]) {
    const rules = read(file).split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
    for (const rule of rules) {
      const from = rule.split(/\s+/)[0];
      const matches = from === keyPath || (from.endsWith("*") && keyPath.startsWith(from.slice(0, -1)));
      assert.equal(matches, false, `${file} redirects ${keyPath} via ${from}`);
    }
  }
});

test("changed HTML maps to that site's canonical URL", () => {
  const files = {
    "index.html": read("index.html"),
    "privacy-policy.html": read("privacy-policy.html"),
    "support.html": read("support.html"),
    "404.html": read("404.html"),
    "contact/thanks/index.html": read("contact/thanks/index.html"),
    "claimsnative/index.html": read("claimsnative/index.html"),
    "claimsnative/404.html": read("claimsnative/404.html"),
    "claimsnative/learn/how-to-read-an-era/index.html": read("claimsnative/learn/how-to-read-an-era/index.html"),
  };
  const changes = Object.keys(files).map((file) => ({ path: file }));
  const readHtml = (change) => files[change.path];
  assert.deepEqual(selectUrls(SITES[0], changes, readHtml, []).sort(), [
    "https://atomandbits.com/",
    "https://atomandbits.com/privacy-policy",
    "https://atomandbits.com/support",
  ]);
  assert.deepEqual(selectUrls(SITES[1], changes, readHtml, []).sort(), [
    "https://claimsnative.com/",
    "https://claimsnative.com/learn/how-to-read-an-era/",
  ]);
  assert.equal(canonicalUrl(files["404.html"]), null);
  assert.equal(canonicalUrl(files["claimsnative/404.html"]), null);
});

test("a missing diff submits the sitemap, and an empty diff submits nothing", () => {
  const sitemap = ["https://atomandbits.com/", "https://claimsnative.com/"];
  assert.deepEqual(selectUrls(SITES[0], null, () => "", sitemap), ["https://atomandbits.com/"]);
  assert.deepEqual(selectUrls(SITES[0], [], () => "", sitemap), []);
});

test("a deploy notifies its own site only after the publish step succeeds", () => {
  assert.equal(deployTarget("Deploy atomandbits.com to Cloudflare").host, "atomandbits.com");
  assert.equal(deployTarget("Deploy Claims Native to Cloudflare").step, "Deploy the Pages site");
  assert.equal(deployTarget("Something else"), null);
  const jobs = [
    { name: "test", steps: [{ name: "Test", conclusion: "success" }] },
    { name: "deploy", steps: [{ name: "Deploy the Pages site", conclusion: "skipped" }, { name: "Deploy the www redirect", conclusion: "skipped" }] },
  ];
  assert.equal(stepSucceeded(jobs, "Deploy the Pages site"), false);
  jobs[1].steps[0].conclusion = "success";
  assert.equal(stepSucceeded(jobs, "Deploy the Pages site"), true);
  assert.equal(stepSucceeded(jobs, "Deploy the Worker"), false);
});

test("the baseline is the latest publish created before this run", () => {
  const runs = [
    { id: 3, created_at: "2026-11-24T15:00:00Z", head_sha: "ccc" },
    { id: 2, created_at: "2026-11-24T14:00:00Z", head_sha: "bbb" },
    { id: 1, created_at: "2026-11-24T13:00:00Z", head_sha: "aaa" },
  ];
  assert.equal(earlierSuccess(runs, 2).head_sha, "aaa");
  assert.equal(earlierSuccess(runs, 1), null);
});

test("parseDiff keeps additions, deletions, and both sides of a rename", () => {
  assert.deepEqual(parseDiff("M\tindex.html\nD\twork/old/index.html\nR100\tguides/a/index.html\tguides/b/index.html\n"), [
    { path: "index.html", deleted: false },
    { path: "work/old/index.html", deleted: true },
    { path: "guides/a/index.html", deleted: true },
    { path: "guides/b/index.html", deleted: false },
  ]);
});

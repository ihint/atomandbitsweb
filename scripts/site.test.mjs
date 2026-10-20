// Checks the files Cloudflare will serve for atomandbits.com: every internal
// link and anchor resolves, retired URLs redirect, cut phrases stay cut, and
// the facts match the "say it the same way everywhere" table.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, posix } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

// .assetsignore entries are either a top-level name or a directory ending in "/".
const ignored = read(".assetsignore").split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
const isIgnored = (path) => ignored.some((entry) => {
  const name = entry.replace(/\*$/, "");
  return entry.endsWith("/") ? path.startsWith(entry) : path === entry || path.split("/")[0] === entry || (entry.endsWith("*") && path.startsWith(name));
});

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    const path = relative(root, full);
    if (isIgnored(path) || isIgnored(path + "/")) return [];
    return statSync(full).isDirectory() ? walk(full) : [path];
  });
}

const served = new Set(walk(root).filter((path) => path !== "_redirects"));
const pages = [...served].filter((path) => path.endsWith(".html"));

const redirects = read("_redirects").split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"))
  .map((line) => { const [from, to, status] = line.split(/\s+/); return { from, to, status }; });

function redirectFor(path) {
  return redirects.find(({ from }) => from === path || (from.endsWith("/*") && path.startsWith(from.slice(0, -1))));
}

// The file Cloudflare serves for a URL path, or null.
function fileFor(path) {
  const clean = decodeURI(path).replace(/^\//, "");
  if (clean === "" || clean.endsWith("/")) return served.has(clean + "index.html") ? clean + "index.html" : null;
  if (served.has(clean)) return clean;
  if (served.has(clean + "/index.html")) return clean + "/index.html";
  if (served.has(clean + ".html")) return clean + ".html";
  return null;
}

const ids = new Map();
const idsIn = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...read(file).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};

const urlOf = (page) => "/" + page.replace(/index\.html$/, "");

test("every internal link and anchor on every page resolves", () => {
  const broken = [];
  for (const page of pages) {
    const html = read(page);
    for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(value)) continue;
      const [withQuery, fragment] = value.split("#");
      const pathPart = withQuery.split("?")[0];
      // Relative links resolve against the page's own folder.
      const target = pathPart === "" ? urlOf(page) : pathPart.startsWith("/") ? pathPart : posix.join(posix.dirname(urlOf(page) + "x"), pathPart);
      const file = fileFor(target);
      if (!file) {
        broken.push(`${page}: ${attr}="${value}"`);
        continue;
      }
      if (fragment && file.endsWith(".html") && !idsIn(file).has(fragment)) broken.push(`${page}: ${value} (no id="${fragment}")`);
    }
  }
  assert.deepEqual(broken, []);
});

test("retired URLs are gone and redirect to a page that exists", () => {
  const retired = {
    "/practice-margin-review/": "/",
    "/method/healthcare-operating-systems/": "/how-i-work/",
    "/healthcare-ai-workflow-assessment/": "/ai-fit-review/",
    "/healthcare-product-strategy/": "/ai-fit-review/",
    "/healthcare-fractional-cto/": "/product-technology-leadership/",
    "/healthcare-ai-operations/": "/agent-workflows/",
  };
  for (const [from, to] of Object.entries(retired)) {
    assert.equal(fileFor(from), null, `${from} still has a page`);
    for (const variant of [from, from.slice(0, -1)]) {
      const rule = redirectFor(variant);
      assert.ok(rule, `${variant} has no redirect`);
      assert.equal(rule.to, to);
      assert.equal(rule.status, "301");
    }
    assert.ok(fileFor(to), `${to} does not exist`);
  }
  const claims = redirectFor("/claimsnative/learn/");
  assert.equal(claims.to, "https://claimsnative.com/:splat");
  assert.equal(claims.status, "301");
});

test("internal redirect targets exist", () => {
  for (const { from, to } of redirects) {
    if (to.startsWith("/")) assert.ok(fileFor(to), `${from} redirects to missing ${to}`);
  }
});

test("repository files that are not part of the site are not served", () => {
  for (const path of ["CLAUDE.md", "README.md", "wrangler.jsonc", "worker/index.js", "scripts/site.test.mjs", ".gitignore", ".assetsignore"]) {
    assert.ok(!served.has(path), `${path} would be public`);
  }
  assert.ok(![...served].some((path) => path.startsWith("claimsnative/") || path.startsWith("docs/")), "claimsnative/ or docs/ would be public");
});

test("cut phrases and arrows stay cut", () => {
  const banned = [/↗/, /founder-operator/i, /system boundaries/i, /completion measures/i, /fit conversation/i, /service-pages\.css/, /fonts\.googleapis/, /Practice Margin Review/i];
  const found = [];
  for (const page of pages) {
    const html = read(page);
    for (const pattern of banned) if (pattern.test(html)) found.push(`${page}: ${pattern}`);
  }
  assert.deepEqual(found, []);
});

test("the homepage mirror matches the homepage", () => {
  assert.equal(read("atom-bits-website.html"), read("index.html"));
});

test("every page has one h1, a title, and the shared stylesheet", () => {
  for (const page of pages) {
    const html = read(page);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${page} needs exactly one h1`);
    assert.match(html, /<title>[^<]+<\/title>/, `${page} has no title`);
    assert.match(html, /href="\/site\.css"/, `${page} does not load site.css`);
    if (!/name="robots" content="noindex"/.test(html)) assert.match(html, /<meta name="description" content="[^"]+">/, `${page} has no description`);
  }
});

test("pages say the facts the same way as the facts table", () => {
  const text = (page) => read(page).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
  const home = text("index.html");
  for (const fact of ["150,000+ clinicians", "$2M → $40M ARR", "3.5M members", "1M members in under 12 months", "$500K a year, the largest contract in company history", "NPS above 60", "$2M to $40M ARR"]) {
    assert.ok(home.includes(fact), `homepage is missing "${fact}"`);
  }
  const about = text("ian-harman/index.html");
  for (const fact of ["VP, Provider Networks & Technology at TPN.health from Feb 2025 to Aug 2026", "After TPN raised $12M", "1M members in under a year", "150,000+ clinicians", "$2M to $40M ARR", "about 3.5M members"]) {
    assert.ok(about.includes(fact), `About is missing "${fact}"`);
  }
  assert.ok(text("work/paragon-truss/index.html").includes("largest contract in company history"));
  for (const page of pages) {
    assert.doesNotMatch(text(page), /lives under care|\$1 million in ARR/, `${page} uses the old TheraMatch wording`);
  }
});

test("the resume link points at the current resume", () => {
  assert.ok(existsSync(join(root, "assets/Ian-Harman-Resume.pdf")));
  assert.match(read("ian-harman/index.html"), /href="\/assets\/Ian-Harman-Resume\.pdf"/);
});

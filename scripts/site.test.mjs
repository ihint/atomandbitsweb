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
  // No page may still point at a retired URL, in a link or in structured data.
  const mentions = pages.flatMap((page) => Object.keys(retired)
    .filter((from) => read(page).includes(from))
    .map((from) => `${page}: ${from}`));
  assert.deepEqual(mentions, []);
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
  for (const path of ["CLAUDE.md", "README.md", "wrangler.jsonc", "worker/index.js", "www-redirect/src/index.mjs", "www-redirect/wrangler.jsonc", "scripts/site.test.mjs", ".gitignore", ".assetsignore"]) {
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

test("the old homepage mirror redirects home", () => {
  assert.equal(existsSync(join(root, "atom-bits-website.html")), false);
  for (const path of ["/atom-bits-website", "/atom-bits-website/", "/atom-bits-website.html"]) {
    assert.equal(fileFor(path), null, path);
    const rule = redirectFor(path);
    assert.ok(rule, `${path} has no redirect`);
    assert.equal(rule.to, "/");
    assert.equal(rule.status, "301");
  }
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
  // Homepage leads with product decisions; the full career figures stay on About.
  for (const fact of ["3.5M members", "$1M+ ARR and 1M members", "$500K annual enterprise contract", "NPS above 60", "$2M to $40M ARR", "22 to 17.5 minutes per encounter", "with clinician and patient satisfaction maintained or improved"]) {
    assert.ok(home.includes(fact), `homepage is missing "${fact}"`);
  }
  const about = text("ian-harman/index.html");
  for (const fact of ["VP, Provider Networks & Technology at TPN.health from Feb 2025 to Aug 2026", "After TPN raised $12M", "1M members in under a year", "150,000+ clinicians", "$2M to $40M ARR", "3.5M members"]) {
    assert.ok(about.includes(fact), `About is missing "${fact}"`);
  }
  assert.ok(text("work/paragon-truss/index.html").includes("$500,000 per year"));
  for (const page of pages) {
    assert.doesNotMatch(text(page), /lives under care|\$1 million in ARR/, `${page} uses the old TheraMatch wording`);
  }
});

test("the resume link points at the current resume", () => {
  assert.ok(existsSync(join(root, "assets/Ian-Harman-Resume.pdf")));
  assert.match(read("ian-harman/index.html"), /href="\/assets\/Ian-Harman-Resume\.pdf"/);
});

test("directory hubs and old Claims Native paths redirect once", () => {
  const rules = {
    "/guides": "/writing/",
    "/guides/": "/writing/",
    "/insights": "/writing/",
    "/insights/": "/writing/",
    "/claimsnative/billing-setup": "https://claimsnative.com/how-we-start/",
    "/claimsnative/billing-setup/": "https://claimsnative.com/how-we-start/",
    "/claimsnative/keep-your-ehr/": "https://claimsnative.com/",
    "/claimsnative/remittance-and-deposits/": "https://claimsnative.com/learn/match-insurance-deposits/",
    "/claimsnative/90-day-pilot/": "https://claimsnative.com/how-we-start/",
    "/claimsnative/independent-practices/": "https://claimsnative.com/",
    "/claimsnative/cloudflare-pages/robots.txt": "https://claimsnative.com/robots.txt",
    "/claimsnative/cloudflare-pages/sitemap.xml": "https://claimsnative.com/sitemap.xml",
    "/privacy-policy.html": "/privacy-policy",
    "/privacy-policy/": "/privacy-policy",
    "/support.html": "/support",
    "/support/": "/support",
  };
  for (const [path, to] of Object.entries(rules)) {
    const rule = redirectFor(path);
    assert.ok(rule, `${path} has no redirect`);
    assert.equal(rule.to, to, path);
    assert.equal(rule.status, "301");
  }
  assert.equal(redirectFor("/guides/how-to-choose-a-healthcare-cto/"), undefined);
  assert.equal(redirectFor("/work/bcbst/"), undefined);
  assert.equal(redirectFor("/insights/why-automated-claims-need-control-states/"), undefined);
});

test("privacy and support canonicals are the clean URLs", () => {
  for (const [file, url] of [["privacy-policy.html", "https://atomandbits.com/privacy-policy"], ["support.html", "https://atomandbits.com/support"]]) {
    const html = read(file);
    assert.ok(html.includes(`rel="canonical" href="${url}"`), file);
    assert.ok(html.includes('name="robots" content="index,follow,max-image-preview:large"'), file);
    assert.ok(html.includes(`property="og:url" content="${url}"`), file);
    assert.ok(html.includes('property="og:image" content="https://atomandbits.com/assets/og-2026-10.png"'), file);
    assert.equal(html.includes(`${url.split("/").pop()}.html"`), false, file);
  }
  for (const page of pages) {
    assert.equal(read(page).includes("Photo placeholder"), false, page);
    assert.equal(read(page).includes('href="/privacy-policy.html"'), false, page);
    assert.equal(read(page).includes('href="/support.html"'), false, page);
  }
});

test("sitemap lists the canonical indexable pages", () => {
  const xml = read("sitemap.xml");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  assert.equal(locs.length, lastmods.length);
  assert.equal(new Set(locs).size, locs.length);
  for (const date of lastmods) assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
  const canonicals = [];
  for (const page of pages) {
    const html = read(page);
    if (/name="robots" content="noindex"/.test(html)) continue;
    const canonical = html.match(/rel="canonical" href="(https:\/\/atomandbits.com[^"]*)"/);
    assert.ok(canonical, `${page} has no canonical`);
    canonicals.push(canonical[1]);
    assert.equal(html.includes('href="/favicon.ico"'), true, `${page} does not point at the icon`);
  }
  assert.deepEqual(locs.slice().sort(), canonicals.slice().sort());
  for (const loc of locs) {
    const path = new URL(loc).pathname;
    assert.ok(fileFor(path), `${loc} does not resolve`);
    assert.equal(loc.endsWith(".html"), false, loc);
  }
});

test("structured data uses one Person and one Organization", () => {
  const personId = "https://atomandbits.com/#ian-harman";
  const orgId = "https://atomandbits.com/#organization";
  for (const page of pages) {
    const html = read(page);
    if (/name="robots" content="noindex"/.test(html)) continue;
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(json);
      const visit = (node) => {
        if (Array.isArray(node)) return node.forEach(visit);
        if (!node || typeof node !== "object") return;
        const types = [].concat(node["@type"] || []);
        if (types.includes("Person") && (node["@id"] === personId || node.name === "Ian Harman")) {
          assert.equal(node.jobTitle, "VP Provider", page);
          assert.equal(node["@id"], personId, page);
          assert.deepEqual(node.sameAs, ["https://www.linkedin.com/in/ianjharman"], page);
        }
        if (node["@id"] === orgId && (types.includes("Organization") || types.includes("ProfessionalService"))) {
          assert.equal(node.url, "https://atomandbits.com/", page);
          assert.equal(node.logo.url, "https://atomandbits.com/assets/logo.png", page);
          assert.match(node.description, /Advisory, fractional CTO and AI builds/, page);
          assert.equal(node.sameAs, undefined, page);
        }
        if (types.includes("Service")) assert.equal(node.provider["@id"], orgId, page);
        if (types.includes("FAQPage")) {
          for (const question of node.mainEntity) {
            assert.equal(html.includes(question.name), true, `${page}: ${question.name}`);
            assert.equal(html.includes(question.acceptedAnswer.text), true, `${page}: answer`);
          }
        }
        Object.values(node).forEach(visit);
      };
      visit(data);
    }
  }
  const ico = readFileSync(join(root, "favicon.ico"));
  assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0]);
  assert.ok(existsSync(join(root, "assets/logo.png")));
  const llms = read("llms.txt");
  assert.match(llms, /VP Provider/);
  assert.match(llms, /https:\/\/atomandbits.com\/privacy-policy\)/);
  assert.match(llms, /https:\/\/atomandbits.com\/support\)/);
  assert.match(llms, /two business days/);
  assert.doesNotMatch(llms, /founder-operator|lives under care|privacy-policy\.html|\/method\/healthcare-operating-systems|\$5,000|\$20,000/);
});

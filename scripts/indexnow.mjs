// Tells IndexNow which pages changed on atomandbits.com and claimsnative.com.
// The key is public: each site serves it at /<key>.txt. A non-2xx response is
// logged and does not fail the run. Search engines share a submission among
// themselves, so one request per host to api.indexnow.org is enough.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const KEY = "2f9b52b4bfae4e4b9ee5fd759a21df2c";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const DEPLOY_WAIT_MS = 180_000;
const MAX_URLS = 10_000;

const ATOM_SKIP = ["claimsnative/", "docs/", "scripts/", "worker/", "www-redirect/", ".github/"];

export const SITES = [
  {
    host: "atomandbits.com",
    sitemap: "sitemap.xml",
    owns(file) {
      return file.endsWith(".html") && !ATOM_SKIP.some((prefix) => file.startsWith(prefix));
    },
  },
  {
    host: "claimsnative.com",
    sitemap: "claimsnative/cloudflare-pages/sitemap.xml",
    owns(file) {
      return file.startsWith("claimsnative/") && file.endsWith(".html") && !file.startsWith("claimsnative/cloudflare-");
    },
  },
];

export function canonicalUrl(html) {
  if (/<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i.test(html)) return null;
  const match = html.match(/<link\s+rel="canonical"\s+href="(https:\/\/[^"]+)"/);
  return match ? match[1] : null;
}

export function parseDiff(text) {
  const changes = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    const [status, first, second] = line.split("\t");
    if (status.startsWith("R") || status.startsWith("C")) {
      changes.push({ path: first, deleted: true });
      changes.push({ path: second, deleted: false });
    } else if (status.startsWith("D")) {
      changes.push({ path: first, deleted: true });
    } else {
      changes.push({ path: first, deleted: false });
    }
  }
  return changes;
}

export function sitemapUrls(file) {
  return [...readFileSync(file, "utf8").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
}

function onHost(url, host) {
  try {
    return new URL(url).host === host;
  } catch {
    return false;
  }
}

// changes === null means the push range could not be read, so the caller
// falls back to the sitemap. An empty list means the push changed no pages.
export function selectUrls(site, changes, readHtml, sitemapList) {
  const listed = sitemapList.filter((url) => onHost(url, site.host));
  if (changes === null) return listed;
  const urls = new Set();
  for (const change of changes) {
    if (!site.owns(change.path)) continue;
    const html = readHtml(change);
    if (!html) continue;
    const url = canonicalUrl(html);
    if (url && onHost(url, site.host)) urls.add(url);
  }
  return [...urls];
}

function loadKey() {
  for (const file of [`${KEY}.txt`, `claimsnative/${KEY}.txt`]) {
    const text = readFileSync(file, "utf8").trim();
    if (text !== KEY) throw new Error(`${file} does not contain the IndexNow key`);
  }
  return KEY;
}

function listChanges(before, sha) {
  if (!before || /^0+$/.test(before)) {
    console.log("This push has no previous commit. Submitting each sitemap.");
    return null;
  }
  try {
    execFileSync("git", ["cat-file", "-e", `${before}^{commit}`], { stdio: "ignore" });
  } catch {
    console.log(`Previous commit ${before} is not in this checkout. Submitting each sitemap.`);
    return null;
  }
  const text = execFileSync("git", ["diff", "--name-status", "--find-renames", "--diff-filter=ACDMRT", before, sha], { encoding: "utf8" });
  return parseDiff(text);
}

function htmlAt(rev, file) {
  try {
    return execFileSync("git", ["show", `${rev}:${file}`], { encoding: "utf8" });
  } catch {
    return null;
  }
}

async function submit(host, key, urls) {
  for (let start = 0; start < urls.length; start += MAX_URLS) {
    const urlList = urls.slice(start, start + MAX_URLS);
    const body = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList,
    };
    console.log(`POST ${ENDPOINT} for ${host} (${urlList.length} URLs)`);
    for (const url of urlList) console.log(`  ${url}`);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
      const text = await response.text();
      console.log(`${host}: HTTP ${response.status}${text ? ` ${text}` : ""}`);
      if (response.status < 200 || response.status >= 300) {
        console.log(`${host}: IndexNow did not accept the submission. The site deploy is unchanged.`);
      }
    } catch (error) {
      console.log(`${host}: IndexNow request failed: ${error.message}`);
    }
  }
}

async function main() {
  const key = loadKey();
  const before = process.env.BEFORE ?? "";
  const sha = process.env.SHA || "HEAD";
  const changes = listChanges(before, sha);
  const plans = SITES.map((site) => ({
    site,
    urls: selectUrls(site, changes, (change) => htmlAt(change.deleted ? before : sha, change.path), sitemapUrls(site.sitemap)),
  }));
  if (plans.every((plan) => plan.urls.length === 0)) {
    console.log("No indexable HTML changed. Nothing to submit.");
    return;
  }
  if (process.env.INDEXNOW_DRY_RUN === "1") {
    for (const plan of plans) {
      console.log(JSON.stringify({ host: plan.site.host, urlList: plan.urls }, null, 2));
    }
    return;
  }
  console.log("Waiting 3 minutes so Cloudflare can finish deploying.");
  await new Promise((resolve) => setTimeout(resolve, DEPLOY_WAIT_MS));
  for (const plan of plans) {
    if (plan.urls.length === 0) {
      console.log(`${plan.site.host}: no changed URLs`);
      continue;
    }
    await submit(plan.site.host, key, plan.urls);
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

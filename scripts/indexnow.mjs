// Tells IndexNow which pages changed on atomandbits.com and claimsnative.com.
// The key is public: each site serves it at /<key>.txt. A push notifies a site
// only after that site's deploy workflow has published the same commit. A
// non-2xx response from IndexNow is logged and does not fail the run. Search
// engines share a submission, so one request per host to api.indexnow.org is enough.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const KEY = "2f9b52b4bfae4e4b9ee5fd759a21df2c";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10_000;

const DEPLOYS = {
  "Deploy atomandbits.com to Cloudflare": { host: "atomandbits.com", workflowFile: "atomandbits-cloudflare.yml", step: "Deploy the Worker" },
  "Deploy Claims Native to Cloudflare": { host: "claimsnative.com", workflowFile: "claimsnative-cloudflare.yml", step: "Deploy the Pages site" },
};

export function deployTarget(workflowName) {
  return DEPLOYS[workflowName] ?? null;
}

export function stepSucceeded(jobs, stepName) {
  for (const job of jobs || []) {
    const step = (job.steps || []).find((item) => item.name === stepName);
    if (step) return step.conclusion === "success";
  }
  return false;
}

// The previous success is the latest run created before this one. A newer
// success that finished first must not become the baseline.
export function earlierSuccess(runs, currentId) {
  const current = (runs || []).find((run) => String(run.id) === String(currentId));
  if (!current) return null;
  return (runs || [])
    .filter((run) => String(run.id) !== String(currentId) && run.created_at < current.created_at && run.head_sha)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0] ?? null;
}

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

async function github(apiPath) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GH_TOKEN is required to read the deploy workflow");
  const response = await fetch(`https://api.github.com${apiPath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub API ${apiPath} returned HTTP ${response.status}`);
  return response.json();
}

// A deploy-triggered run returns the published commit and its baseline, or
// "skip" when that deploy did not publish. A manual run returns null and the
// caller uses BEFORE and SHA from the environment.
async function deploymentRange() {
  const runId = process.env.DEPLOY_RUN_ID;
  if (!runId) return null;
  const conclusion = process.env.DEPLOY_CONCLUSION || "";
  if (conclusion !== "success") {
    console.log(`Deploy concluded ${conclusion || "unknown"}. Not submitting.`);
    return "skip";
  }
  const target = deployTarget(process.env.DEPLOY_WORKFLOW_NAME || "");
  if (!target) {
    console.log(`No IndexNow site for ${process.env.DEPLOY_WORKFLOW_NAME}. Not submitting.`);
    return "skip";
  }
  const repo = process.env.GITHUB_REPOSITORY;
  const headSha = process.env.HEAD_SHA;
  if (!repo || !headSha) throw new Error("GITHUB_REPOSITORY and HEAD_SHA are required after a deploy");
  const jobs = await github(`/repos/${repo}/actions/runs/${runId}/jobs?per_page=100`);
  if (!stepSucceeded(jobs.jobs, target.step)) {
    console.log(`${target.step} did not publish this commit. Not submitting.`);
    for (const job of jobs.jobs || []) {
      for (const step of job.steps || []) console.log(`  ${job.name} / ${step.name}: ${step.conclusion}`);
    }
    return "skip";
  }
  const listed = await github(`/repos/${repo}/actions/workflows/${target.workflowFile}/runs?branch=main&status=success&per_page=30`);
  let runs = listed.workflow_runs || [];
  if (!runs.some((run) => String(run.id) === String(runId))) {
    runs = [await github(`/repos/${repo}/actions/runs/${runId}`), ...runs];
  }
  let before = "";
  while (!before) {
    const previous = earlierSuccess(runs, runId);
    if (!previous) break;
    const previousJobs = await github(`/repos/${repo}/actions/runs/${previous.id}/jobs?per_page=100`);
    if (stepSucceeded(previousJobs.jobs, target.step)) before = previous.head_sha;
    else runs = runs.filter((run) => String(run.id) !== String(previous.id));
  }
  if (!before) console.log("No earlier deploy published this site. Submitting the sitemap.");
  return { before, sha: headSha, host: target.host };
}

async function main() {
  const key = loadKey();
  const deployment = await deploymentRange();
  if (deployment === "skip") return;
  const before = deployment?.before ?? process.env.BEFORE ?? "";
  const sha = deployment?.sha ?? (process.env.SHA || "HEAD");
  const sites = deployment?.host ? SITES.filter((site) => site.host === deployment.host) : SITES;
  const changes = listChanges(before, sha);
  const plans = sites.map((site) => ({
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

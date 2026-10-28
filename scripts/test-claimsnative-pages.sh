#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

output_dir="$test_dir/site"
"$repo_dir/scripts/build-claimsnative-pages.sh" "$output_dir"

test -f "$output_dir/404.html"
test -f "$output_dir/llms.txt"
test -f "$output_dir/favicon.ico"
test -f "$output_dir/logo.png"
test ! -e "$output_dir/cloudflare-www-redirect"
test ! -e "$output_dir/90-day-pilot"
test ! -e "$output_dir/independent-practices"
grep -Fq "Page not found | Claims Native" "$output_dir/404.html"
if grep -Fq 'rel="canonical"' "$output_dir/404.html"; then
  echo "404 page names a canonical URL" >&2
  exit 1
fi
if grep -Fq '404.html' "$output_dir/404.html"; then
  echo "404 page names /404.html" >&2
  exit 1
fi
grep -Fq 'name="robots" content="noindex"' "$output_dir/404.html" || { echo "404 page is missing noindex" >&2; exit 1; }
if grep -Fq '404' "$output_dir/sitemap.xml"; then
  echo "Sitemap lists the 404 page" >&2
  exit 1
fi
grep -Fq "https://static.cloudflareinsights.com" "$output_dir/_headers"
grep -Fq "connect-src 'self'" "$output_dir/_headers"
grep -Fq "CLOUDFLARE_API_TOKEN" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"
grep -Fq "CLOUDFLARE_ACCOUNT_ID" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"

# Copy guard. Claims Native is a billing service for independent practices.
# The site never says a payer paid, never promises or guarantees a payment,
# never claims to replace a biller (ADR 0009 is a draft), never claims live
# submission or AI-verified coding, never mentions behavioral health, and
# never links the demo workspace.
for page in $(find "$output_dir" -name '*.html'); do
  for banned in "payer paid" "paid by the payer" "guaranteed" "guarantee" \
    "replace your biller" "replace your billing" "submits claims today" \
    "AI-verified" "behavioral health" "office-demo" "provider-demo" \
    "demo.claimsnative.com"; do
    if grep -Fqi -- "$banned" "$page"; then
      echo "Copy guard: '$banned' found in $page" >&2
      exit 1
    fi
  done
done

# The home page and the how-we-start page carry the fee, the business
# associate agreement and the client app address.
for page in "$output_dir/index.html" "$output_dir/how-we-start/index.html"; do
  for fact in '$500' 'business associate agreement' 'app.claimsnative.com'; do
    grep -Fq -- "$fact" "$page" || { echo "$page lacks $fact" >&2; exit 1; }
  done
done

# The chiropractic page names the CMT codes and the AT modifier.
for fact in '98941' 'AT modifier'; do
  grep -Fq -- "$fact" "$output_dir/chiropractors/index.html" || { echo "Chiropractors page lacks $fact" >&2; exit 1; }
done

# Billing guides. The index links to every group and every guide. Each guide
# links back to the index and to its group's overview, and to at least two
# other guides; each group overview links to its guides. Every guide and
# overview carries its own canonical and is in the sitemap.
groups="starting-with-insurance after-the-claim-goes-out choosing-how-to-bill"
guide_groups="payer-enrollment-for-chiropractors:starting-with-insurance bluecross-tennessee-credentialing:starting-with-insurance chiropractic-fee-schedule:starting-with-insurance chiropractic-insurance-verification:starting-with-insurance clean-chiropractic-claim:starting-with-insurance rejected-vs-denied-claims:after-the-claim-goes-out how-to-read-an-era:after-the-claim-goes-out chiropractic-denial-codes:after-the-claim-goes-out match-insurance-deposits:after-the-claim-goes-out patient-balance-after-insurance:after-the-claim-goes-out chiropractic-billing-service-cost:choosing-how-to-bill billing-numbers-to-check:choosing-how-to-bill questions-to-ask-a-billing-service:choosing-how-to-bill switching-billers:choosing-how-to-bill"
guides=""
for pair in $guide_groups; do guides="$guides ${pair%%:*}"; done
grep -Fq '<link rel="canonical" href="https://claimsnative.com/learn/">' "$output_dir/learn/index.html" || { echo "Guide index has the wrong canonical" >&2; exit 1; }
for group in $groups; do
  page="$output_dir/learn/$group/index.html"
  test -f "$page" || { echo "Missing guide group: $group" >&2; exit 1; }
  grep -Fq "href=\"/learn/$group/\"" "$output_dir/learn/index.html" || { echo "Guide index lacks a link to $group" >&2; exit 1; }
  grep -Fq "<link rel=\"canonical\" href=\"https://claimsnative.com/learn/$group/\">" "$page" || { echo "$group has the wrong canonical" >&2; exit 1; }
  grep -Fq "<loc>https://claimsnative.com/learn/$group/</loc>" "$output_dir/sitemap.xml" || { echo "Sitemap lacks $group" >&2; exit 1; }
done
for pair in $guide_groups; do
  guide="${pair%%:*}"
  group="${pair##*:}"
  page="$output_dir/learn/$guide/index.html"
  test -f "$page" || { echo "Missing guide: $guide" >&2; exit 1; }
  grep -Fq "href=\"/learn/$guide/\"" "$output_dir/learn/index.html" || { echo "Guide index lacks a link to $guide" >&2; exit 1; }
  grep -Fq "href=\"/learn/$guide/\"" "$output_dir/learn/$group/index.html" || { echo "$group lacks a link to $guide" >&2; exit 1; }
  grep -Fq '<li><a href="/learn/">Billing guides</a></li>' "$page" || { echo "$guide lacks the breadcrumb to the guide index" >&2; exit 1; }
  grep -Fq "href=\"/learn/$group/\"" "$page" || { echo "$guide lacks a link to $group" >&2; exit 1; }
  siblings=0
  for other in $guides; do
    [[ "$other" == "$guide" ]] && continue
    grep -Fq "href=\"/learn/$other/\"" "$page" && siblings=$((siblings + 1))
  done
  (( siblings >= 2 )) || { echo "$guide links to $siblings other guides; it needs 2" >&2; exit 1; }
  grep -Fq "<link rel=\"canonical\" href=\"https://claimsnative.com/learn/$guide/\">" "$page" || { echo "$guide has the wrong canonical" >&2; exit 1; }
  grep -Fq "<loc>https://claimsnative.com/learn/$guide/</loc>" "$output_dir/sitemap.xml" || { echo "Sitemap lacks $guide" >&2; exit 1; }
done
for page in $(find "$output_dir" -name '*.html'); do
  grep -Fq 'href="/learn/">Billing guides</a>' "$page" || { echo "$page lacks the Billing guides footer link" >&2; exit 1; }
  grep -Fq 'href="https://x.com/claimsnative"' "$page" || { echo "$page lacks the X footer link" >&2; exit 1; }
  grep -Fq '<meta name="twitter:site" content="@claimsnative">' "$page" || { echo "$page lacks twitter:site" >&2; exit 1; }
  grep -Eq '<script src="/signup-source\.js(\?v=[0-9-]+)?" defer></script>' "$page" || { echo "$page lacks the signup source script" >&2; exit 1; }
done
test -f "$output_dir/signup-source.js"
# Every page under learn/ is listed above, so none ships untested.
expected=$(( $(wc -w <<< "$groups") + $(wc -w <<< "$guides") ))
actual=$(find "$output_dir/learn" -mindepth 2 -name index.html | wc -l)
(( actual == expected )) || { echo "learn/ has $actual pages; the test lists $expected" >&2; exit 1; }

# Every internal link and in-page anchor on the built site resolves.
OUT="$output_dir" node <<'JS'
const fs = require('fs');
const path = require('path');
const root = process.env.OUT;
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
let bad = 0;
for (const file of walk(root).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const page = path.relative(root, file);
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const target = path.join(root, href);
    const isFile = fs.existsSync(target) && fs.statSync(target).isFile();
    if (!isFile && !fs.existsSync(path.join(target, 'index.html'))) {
      console.error(`${page} links to missing ${href}`);
      bad += 1;
    }
  }
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${id}"`)) {
      console.error(`${page} links to missing #${id}`);
      bad += 1;
    }
  }
}
process.exit(bad ? 1 : 0);
JS

# atomandbits.com serves the same source files under /claimsnative/. Their
# canonical must name claimsnative.com so search engines keep one copy.
if grep -rlF --include='*.html' '<link rel="canonical" href="https://atomandbits.com/claimsnative/' "$repo_dir/claimsnative"; then
  echo "A Claims Native source page names atomandbits.com as canonical" >&2
  exit 1
fi

# Every page carries the primary action (Get started, to the app signup),
# the Talk to us mailto, the client sign-in and the calculator footer link.
for page in $(find "$output_dir" -name '*.html'); do
  grep -Fq -- 'https://app.claimsnative.com/signup' "$page" || { echo "$page lacks the Get started link" >&2; exit 1; }
  grep -Fq -- 'subject=Claims%20Native%20for%20my%20practice' "$page" || { echo "$page lacks the Talk to us mailto" >&2; exit 1; }
  grep -Fq -- 'https://app.claimsnative.com/login' "$page" || { echo "$page lacks the sign-in link" >&2; exit 1; }
  grep -Fq -- 'href="/insurance-opportunity/"' "$page" || { echo "$page lacks the calculator link" >&2; exit 1; }
done

# The home page and the chiropractic page link the calculator in the body
# as well as the footer.
for page in "$output_dir/index.html" "$output_dir/chiropractors/index.html"; do
  links=$(grep -o 'href="/insurance-opportunity/"' "$page" | wc -l | tr -d ' ')
  [ "$links" -ge 2 ] || { echo "$page links the calculator $links time(s); want body and footer" >&2; exit 1; }
done

# The home page title and headline carry the October 2026 copy.
grep -Fq '<title>Signed Visits Into Deposits · Claims Native</title>' "$output_dir/index.html" || { echo "Home page title changed" >&2; exit 1; }
grep -Fq '<h1 id="hero-title">Insurance billing that turns signed visits into deposits.</h1>' "$output_dir/index.html" || { echo "Home page headline changed" >&2; exit 1; }

# The proof slot ships nothing by default: no marker, no FILL-ME text.
for word in 'proof-slot' 'FILL-ME'; do
  if grep -Fq -- "$word" "$output_dir/index.html"; then
    echo "Home page ships the proof slot ($word) without the flag" >&2
    exit 1
  fi
done

# Redirects: the retired pages send readers to the pages that replaced them.
for rule in '/90-day-pilot/ /how-we-start/ 301' '/90-day-pilot/index.html /how-we-start/ 301' '/independent-practices/ / 301'; do
  grep -Fxq -- "$rule" "$output_dir/_redirects" || { echo "_redirects lacks: $rule" >&2; exit 1; }
done
if grep -Fq -- "/chiropractors" "$output_dir/_redirects"; then
  echo "_redirects still redirects the chiropractors page" >&2
  exit 1
fi

# llms.txt states both plans, full billing first, and does not name the founder.
grep -Fq 'Full billing is for a practice billing up to $10,000 a month' "$output_dir/llms.txt" || { echo "llms.txt lacks the full-billing audience" >&2; exit 1; }
grep -Fq '$500 a month' "$output_dir/llms.txt" || { echo "llms.txt lacks full billing price" >&2; exit 1; }
grep -Fq '$990 a month per location' "$output_dir/llms.txt" || { echo "llms.txt lacks Starter price" >&2; exit 1; }
awk 'index($0,"$500") && !seen500 {seen500=NR} index($0,"$990") && !seen990 {seen990=NR} END {exit !(seen500 && seen990 && seen500 < seen990)}' "$output_dir/llms.txt" || { echo "llms.txt does not lead with full billing" >&2; exit 1; }
for link in 'https://claimsnative.com/' 'https://claimsnative.com/chiropractors/' 'https://claimsnative.com/how-we-start/' 'https://claimsnative.com/insurance-opportunity/' 'https://claimsnative.com/learn/' 'https://claimsnative.com/learn/how-to-read-an-era/'; do
  grep -Fq "$link" "$output_dir/llms.txt" || { echo "llms.txt lacks $link" >&2; exit 1; }
done
for banned in 'Ian Harman' 'Atom & Bits' 'Atom &amp; Bits' 'founder'; do
  if grep -Fq -- "$banned" "$output_dir/llms.txt"; then
    echo "llms.txt names '$banned'" >&2
    exit 1
  fi
done

# Favicon link, organization logo and description, both plan prices, no founder.
for page in $(find "$output_dir" -name '*.html'); do
  grep -Fq 'href="/favicon.ico"' "$page" || { echo "$page lacks the favicon link" >&2; exit 1; }
  grep -Fq 'https://claimsnative.com/logo.png' "$page" || { echo "$page lacks the organization logo" >&2; exit 1; }
  grep -Fq 'Medical billing service for independent practices.' "$page" || { echo "$page lacks the organization description" >&2; exit 1; }
  if grep -Fq '"founder"' "$page"; then
    echo "$page has a founder field" >&2
    exit 1
  fi
done

# Pages that publish a price carry both plans in schema, full billing first.
for page in "$output_dir/index.html" "$output_dir/chiropractors/index.html" "$output_dir/how-we-start/index.html" "$output_dir/insurance-opportunity/index.html"; do
  grep -Fq '"name": "Full billing"' "$page" || { echo "$page lacks the full billing offer" >&2; exit 1; }
  grep -Fq '"name": "Starter"' "$page" || { echo "$page lacks the Starter offer" >&2; exit 1; }
  python3 - "$page" <<'PY' || { echo "$page schema does not price full billing before Starter" >&2; exit 1; }
import json, re, sys
html = open(sys.argv[1]).read()
data = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html).group(1))
offers = []
def walk(node):
    if isinstance(node, dict):
        if node.get("@type") == "Service":
            offers.extend(node.get("offers") or [])
        for value in node.values():
            walk(value)
    elif isinstance(node, list):
        for value in node:
            walk(value)
walk(data)
prices = [offer.get("price") for offer in offers]
if prices[:2] != ["500", "990"]:
    raise SystemExit(1)
PY
done

# Visible FAQ on the homepage and the chiropractic page matches FAQPage JSON-LD.
python3 - "$output_dir" <<'PY'
import json, re, sys
from pathlib import Path
root = Path(sys.argv[1])
banned = ("only", "unique", "no one else", "—", "Ian Harman", "Atom & Bits", "founder")
for rel in ("index.html", "chiropractors/index.html"):
    html = (root / rel).read_text()
    section = re.search(r'<section class="questions-section" id="faq"[\s\S]*?</section>', html)
    if not section:
        raise SystemExit(f"{rel} lacks a visible FAQ")
    block = section.group(0)
    for word in banned:
        if word in block.lower() if word == "only" else word in block:
            # "only" is matched as a word below
            if word != "only":
                raise SystemExit(f"{rel} FAQ contains {word}")
    if re.search(r"\bonly\b", block, re.I):
        raise SystemExit(f"{rel} FAQ contains only")
    visible = []
    for chunk in re.findall(r"<details open>\s*<summary>(.*?)</summary>(.*?)</details>", block, re.S):
        question = chunk[0].strip()
        answers = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", p)).strip() for p in re.findall(r"<p>(.*?)</p>", chunk[1], re.S)]
        visible.append((question, " ".join(answers)))
    data = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', html).group(1))
    faq = next(node for node in data["@graph"] if node.get("@type") == "FAQPage")
    schema = [(q["name"], re.sub(r"\s+", " ", q["acceptedAnswer"]["text"]).strip()) for q in faq["mainEntity"]]
    if visible != schema:
        raise SystemExit(f"{rel} FAQ markup does not match the visible questions")
    names = [name for name, _ in visible]
    expected = [
        "What is Claims Native?",
        "Who is it for?",
        "What does it cost?",
        "Do I have to switch my EHR or my biller?",
        "Which payers and EHRs does it work with today?",
        "Do I sign a business associate agreement?",
        "How long does it take to go live?",
    ]
    if names != expected:
        raise SystemExit(f"{rel} FAQ questions changed: {names}")
    cost = dict(visible)["What does it cost?"]
    if cost.find("$500") == -1 or cost.find("$990") == -1 or cost.find("$500") > cost.find("$990"):
        raise SystemExit(f"{rel} cost answer does not lead with full billing")
print("faq ok")
PY

node --test "$repo_dir/claimsnative/cloudflare-www-redirect/test/redirect.test.mjs"
node --test "$repo_dir/scripts/signup-source.test.mjs"

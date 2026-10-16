#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

output_dir="$test_dir/site"
"$repo_dir/scripts/build-claimsnative-pages.sh" "$output_dir" production

test -f "$output_dir/404.html"
test ! -e "$output_dir/cloudflare-www-redirect"
test ! -e "$output_dir/90-day-pilot"
test ! -e "$output_dir/independent-practices"
grep -Fq "Page not found | Claims Native" "$output_dir/404.html"
grep -Fq "https://static.cloudflareinsights.com" "$output_dir/_headers"
grep -Fq "connect-src 'self'" "$output_dir/_headers"
grep -Fq "CLOUDFLARE_API_TOKEN" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"
grep -Fq "CLOUDFLARE_ACCOUNT_ID" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"

# Copy guard. Claims Native is a billing service for medical practices
# nationwide, across specialties. The site never says a payer paid, never
# promises or guarantees a payment, never claims to replace a biller (ADR 0009
# is a draft), never claims live submission or AI-verified coding, and never
# links the demo workspace. Behavioral health appears only as one example
# specialty. No direct EHR integration is built, so the site never claims one
# for every EHR, all specialties or all payers, and never offers a ChatGPT app.
# Setup offers Jane, ChiroHD or "Another EHR" with no field for the name, so
# the site never asks a practice to name its EHR at signup.
for page in $(find "$output_dir" -name '*.html'); do
  for banned in "payer paid" "paid by the payer" "guaranteed" "guarantee" \
    "replace your biller" "replace your billing" "submits claims today" \
    "AI-verified" "office-demo" "provider-demo" "demo.claimsnative.com" \
    "integrates with" "integrates directly" "every EHR" "all EHRs" \
    "EHRs we take visits from" "every specialty" "all specialties" \
    "all payers" "ChatGPT" "name your EHR"; do
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

# The home page speaks to every specialty and EHR without overclaiming:
# example specialties, the EHR promise with its onboarding qualifier, the
# five first questions, and links to the chiropractic page and calculator.
for fact in 'Your specialty. Your&nbsp;EHR. Less billing work.' \
  'See how it works for your practice' 'Keep your existing EHR' \
  'confirm the connection approach during onboarding' \
  'Primary care' 'behavioral health' 'cardiology' 'dermatology' \
  'orthopedics' 'chiropractic' 'not a list you have to be on' \
  'Which specialties do you work with?' 'Where do you operate?' \
  'Do I have to change EHRs?' 'How does setup work?' \
  'What happens if my EHR isn’t listed?' 'href="/chiropractors/"' \
  'href="/insurance-opportunity/"'; do
  grep -Fq -- "$fact" "$output_dir/index.html" || { echo "Home page lacks: $fact" >&2; exit 1; }
done

# Pages that describe EHR connections carry the same limit.
for page in "$output_dir/index.html" "$output_dir/how-we-start/index.html" "$output_dir/chiropractors/index.html"; do
  grep -Fq -- 'No direct EHR connection is live yet.' "$page" || { echo "$page lacks the EHR connection limit" >&2; exit 1; }
done

# The primary navigation names specialties and EHRs, not one specialty.
for page in $(find "$output_dir" -name '*.html'); do
  nav="$(sed -n '/aria-label="Primary navigation"/,/<\/nav>/p' "$page")"
  for link in 'href="/#specialties"' 'href="/#your-ehr"' 'href="/how-we-start/"'; do
    grep -Fq -- "$link" <<<"$nav" || { echo "$page primary nav lacks $link" >&2; exit 1; }
  done
  if grep -Fq -- '/chiropractors/' <<<"$nav"; then
    echo "$page primary nav still leads with one specialty" >&2
    exit 1
  fi
done

# Structured data parses on every page, and each homepage FAQ question is a
# visible question on the page.
node - "$output_dir" <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
})(root);
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(json);
    if (!page.endsWith(`${path.sep}index.html`) || path.dirname(page) !== root) continue;
    const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage');
    if (!faq) throw new Error('Home page JSON-LD lacks the FAQPage');
    for (const question of faq.mainEntity) {
      if (!html.includes(`<summary>${question.name}</summary>`)) {
        throw new Error(`FAQPage question is not on the page: ${question.name}`);
      }
    }
  }
}
NODE

# Every page carries the primary action (Get started, to the app signup),
# the Talk to us mailto and the client sign-in.
for page in $(find "$output_dir" -name '*.html'); do
  grep -Fq -- 'https://app.claimsnative.com/signup' "$page" || { echo "$page lacks the Get started link" >&2; exit 1; }
  grep -Fq -- 'subject=Claims%20Native%20for%20my%20practice' "$page" || { echo "$page lacks the Talk to us mailto" >&2; exit 1; }
  grep -Fq -- 'https://app.claimsnative.com/login' "$page" || { echo "$page lacks the sign-in link" >&2; exit 1; }
done

# Redirects: the retired pages send readers to the pages that replaced them.
for rule in '/90-day-pilot/ /how-we-start/ 301' '/90-day-pilot/index.html /how-we-start/ 301' '/independent-practices/ / 301'; do
  grep -Fxq -- "$rule" "$output_dir/_redirects" || { echo "_redirects lacks: $rule" >&2; exit 1; }
done
if grep -Fq -- "/chiropractors" "$output_dir/_redirects"; then
  echo "_redirects still redirects the chiropractors page" >&2
  exit 1
fi

node --test "$repo_dir/claimsnative/cloudflare-www-redirect/test/redirect.test.mjs"

# Growth payload, source, consent, deduplication, links and structured-data checks.
node --test "$repo_dir/tests/claimsnative-growth/measurement.test.cjs"
python3 "$repo_dir/scripts/check-claimsnative-growth.py" "$output_dir"
"$repo_dir/scripts/build-claimsnative-pages.sh" "$test_dir/preview" preview
grep -Fq 'X-Robots-Tag: noindex, nofollow' "$test_dir/preview/_headers"
test ! -e "$test_dir/preview/sitemap.xml"
if grep -R -F 'content="index,follow' "$test_dir/preview" --include='*.html'; then exit 1; fi

python3 -m unittest discover -s "$repo_dir/tests/claimsnative-growth" -p 'test_*.py'

# A source mention must not imply a proved live EHR workflow.
for page in "$output_dir/index.html" "$output_dir/how-we-start/index.html" "$output_dir/chiropractors/index.html"; do
  grep -Fq 'Eligibility checks, claim filing and payment posting need validation for your practice.' "$page"
  if grep -Fq 'We post each payment into your EHR' "$page"; then exit 1; fi
  if grep -Fq 'We read signed visits and post payments through that login' "$page"; then exit 1; fi
done

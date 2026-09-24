#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

output_dir="$test_dir/site"
"$repo_dir/scripts/build-claimsnative-pages.sh" "$output_dir"

test -f "$output_dir/404.html"
test ! -e "$output_dir/cloudflare-www-redirect"
test ! -e "$output_dir/90-day-pilot"
test ! -e "$output_dir/independent-practices"
grep -Fq "Page not found | Claims Native" "$output_dir/404.html"
grep -Fq "https://static.cloudflareinsights.com" "$output_dir/_headers"
grep -Fq "connect-src 'self'" "$output_dir/_headers"
grep -Fq "CLOUDFLARE_API_TOKEN" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"
grep -Fq "CLOUDFLARE_ACCOUNT_ID" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"

# Copy guard. Claims Native is a billing service for independent practices.
# The site never says a payer paid, never promises or guarantees a payment,
# never claims to replace a biller (ADR 0009 is a draft), never claims live
# submission or AI-verified coding, never mentions behavioral health, and
# never links the demo workspace or a signup.
for page in $(find "$output_dir" -name '*.html'); do
  for banned in "payer paid" "paid by the payer" "guaranteed" "guarantee" \
    "replace your biller" "replace your billing" "submits claims today" \
    "AI-verified" "behavioral health" "office-demo" "provider-demo" \
    "demo.claimsnative.com" "signup"; do
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

# Every page carries the one primary action and the client sign-in.
for page in $(find "$output_dir" -name '*.html'); do
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

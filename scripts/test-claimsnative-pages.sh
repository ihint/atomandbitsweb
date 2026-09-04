#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

output_dir="$test_dir/site"
"$repo_dir/scripts/build-claimsnative-pages.sh" "$output_dir"

test -f "$output_dir/404.html"
test ! -e "$output_dir/cloudflare-www-redirect"
grep -Fq "Page not found | Claims Native" "$output_dir/404.html"
grep -Fq "https://static.cloudflareinsights.com" "$output_dir/_headers"
grep -Fq "connect-src 'self'" "$output_dir/_headers"
grep -Fq "CLOUDFLARE_API_TOKEN" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"
grep -Fq "CLOUDFLARE_ACCOUNT_ID" "$repo_dir/.github/workflows/claimsnative-cloudflare.yml"

# Copy guard: the site never claims a payer paid, never promises, and never
# leaks a demo access code. The pilot page always carries the price facts.
for page in $(find "$output_dir" -name '*.html'); do
  for banned in "payer paid" "paid by the payer" "guaranteed" "office-demo" "provider-demo"; do
    if grep -Fqi -- "$banned" "$page"; then
      echo "Copy guard: '$banned' found in $page" >&2
      exit 1
    fi
  done
done
for fact in '$500' '$249' '200 visits' '$1.25'; do
  grep -Fq -- "$fact" "$output_dir/90-day-pilot/index.html" || { echo "Pilot page lacks $fact" >&2; exit 1; }
done

node --test "$repo_dir/claimsnative/cloudflare-www-redirect/test/redirect.test.mjs"

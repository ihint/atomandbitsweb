#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

output_dir="$test_dir/site"
"$repo_dir/scripts/build-atomandbits-pages.sh" "$output_dir"

fail() { echo "$1" >&2; exit 1; }

expect_stub() {
  local file="$1" target="$2"
  test -f "$file" || fail "Missing redirect stub: ${file#"$output_dir"/}"
  grep -Fq "<meta http-equiv=\"refresh\" content=\"0; url=$target\">" "$file" || fail "${file#"$output_dir"/} does not refresh to $target"
  grep -Fq "<link rel=\"canonical\" href=\"$target\">" "$file" || fail "${file#"$output_dir"/} does not name $target as canonical"
}

# Every live Claims Native page redirects to the same path on claimsnative.com.
while IFS= read -r -d '' page; do
  relative="${page#"$repo_dir/claimsnative"/}"
  [[ "$relative" == "404.html" ]] && continue
  expect_stub "$output_dir/claimsnative/$relative" "https://claimsnative.com/${relative%index.html}"
done < <(find "$repo_dir/claimsnative" -name '*.html' -not -path '*/cloudflare-*' -print0)

# Retired pages go where claimsnative.com sends them.
expect_stub "$output_dir/claimsnative/90-day-pilot/index.html" "https://claimsnative.com/how-we-start/"
expect_stub "$output_dir/claimsnative/independent-practices/index.html" "https://claimsnative.com/"

# No full Claims Native page is left on atomandbits.com, and no edge config.
while IFS= read -r -d '' page; do
  grep -Fq 'http-equiv="refresh"' "$page" || fail "${page#"$output_dir"/} is a full page, not a redirect"
done < <(find "$output_dir/claimsnative" -name '*.html' -print0)
test ! -e "$output_dir/claimsnative/cloudflare-pages" || fail "Edge config is published"
test ! -e "$output_dir/claimsnative/cloudflare-www-redirect" || fail "Redirect worker source is published"
test ! -e "$output_dir/.git" || fail "The .git directory is published"
test -f "$output_dir/claimsnative/og-simple-20260911.png" || fail "Claims Native images are missing"

# The rest of atomandbits.com is published unchanged.
for file in index.html CNAME .nojekyll sitemap.xml robots.txt guides/should-cash-pay-practice-accept-insurance/index.html; do
  cmp -s "$repo_dir/$file" "$output_dir/$file" || fail "$file differs from the repository"
done

echo "atomandbits.com Pages build OK"

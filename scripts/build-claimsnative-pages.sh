#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_dir/claimsnative"
config_dir="$source_dir/cloudflare-pages"
output_dir="${1:-}"

if [[ -z "$output_dir" ]]; then
  echo "Usage: $0 OUTPUT_DIR" >&2
  exit 1
fi

if [[ -e "$output_dir" ]]; then
  echo "Output path already exists: $output_dir" >&2
  exit 1
fi

mkdir -p "$output_dir"
cp -R "$source_dir"/. "$output_dir"/
rm -rf "$output_dir/cloudflare-pages"

while IFS= read -r -d '' file; do
  perl -0pi -e 's#https://atomandbits\.com/claimsnative/#https://claimsnative.com/#g' "$file"
  perl -0pi -e 's#https://atomandbits\.com/og-2026-v3\.png#https://claimsnative.com/og.png#g' "$file"
  perl -0pi -e 's#(["\x27])/claimsnative/#$1/#g' "$file"
  perl -0pi -e 's#href="/guides/#href="https://atomandbits.com/guides/#g' "$file"
  perl -0pi -e 's#href="/privacy-policy\.html"#href="https://atomandbits.com/privacy-policy.html"#g' "$file"
  perl -0pi -e 's#href="/">Atom &amp; Bits</a>#href="https://atomandbits.com/">Atom &amp; Bits</a>#g' "$file"
  perl -0pi -e 's#(<meta name="viewport"[^>]*>\n)(?!\s*<link rel="icon")#$1  <link rel="icon" href="/og.png" type="image/png">\n#' "$file"
done < <(find "$output_dir" -name '*.html' -print0)

cp "$config_dir/_headers" "$output_dir/_headers"
cp "$config_dir/_redirects" "$output_dir/_redirects"
cp "$config_dir/robots.txt" "$output_dir/robots.txt"
cp "$config_dir/sitemap.xml" "$output_dir/sitemap.xml"

echo "Built Claims Native Pages site at $output_dir"

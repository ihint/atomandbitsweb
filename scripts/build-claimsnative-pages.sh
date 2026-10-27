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
rm -rf "$output_dir/cloudflare-www-redirect"

while IFS= read -r -d '' file; do
  perl -0pi -e 's#https://atomandbits\.com/claimsnative/#https://claimsnative.com/#g' "$file"
  perl -0pi -e 's#https://atomandbits\.com/og-2026-v3\.png#https://claimsnative.com/og.png#g' "$file"
  perl -0pi -e 's#(["\x27])/claimsnative/#$1/#g' "$file"
  perl -0pi -e 's#href="/guides/#href="https://atomandbits.com/guides/#g' "$file"
  perl -0pi -e 's#href="/privacy-policy\.html"#href="https://atomandbits.com/privacy-policy.html"#g' "$file"
  perl -0pi -e 's#href="/">Atom &amp; Bits</a>#href="https://atomandbits.com/">Atom &amp; Bits</a>#g' "$file"
  perl -0pi -e 's#(<meta name="viewport"[^>]*>\n)(?!\s*<link rel="icon")#$1  <link rel="icon" href="/og.png" type="image/png">\n#' "$file"
done < <(find "$output_dir" -name '*.html' -print0)

# The home page proof slot ships only when CLAIMSNATIVE_PROOF_STRIP=1 and the
# partial has no FILL-ME marker left. Otherwise the marker comment is removed
# so nothing about the slot reaches the page.
proof_slot="$repo_dir/scripts/claimsnative-proof-slot.html"
if [[ "${CLAIMSNATIVE_PROOF_STRIP:-0}" == "1" ]]; then
  if grep -Fq "FILL-ME" "$proof_slot"; then
    echo "Proof slot still has FILL-ME markers: $proof_slot" >&2
    exit 1
  fi
  PROOF_SLOT="$proof_slot" perl -0pi -e 'open(my $h, "<", $ENV{PROOF_SLOT}) or die; local $/; my $s = <$h>; s#<!-- proof-slot -->\n#$s#' "$output_dir/index.html"
else
  perl -0pi -e 's#<!-- proof-slot -->\n##' "$output_dir/index.html"
fi

cp "$config_dir/_headers" "$output_dir/_headers"
cp "$config_dir/_redirects" "$output_dir/_redirects"
cp "$config_dir/robots.txt" "$output_dir/robots.txt"
cp "$config_dir/sitemap.xml" "$output_dir/sitemap.xml"
# llms.txt, the favicon and the schema logo live in claimsnative/ and ship
# at the site root. cp -R already placed them; copy again so this step fails
# if one of them is missing from the source.
cp "$source_dir/llms.txt" "$output_dir/llms.txt"
cp "$source_dir/favicon.ico" "$output_dir/favicon.ico"
cp "$source_dir/logo.png" "$output_dir/logo.png"

echo "Built Claims Native Pages site at $output_dir"

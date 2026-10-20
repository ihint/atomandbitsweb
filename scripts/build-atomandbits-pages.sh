#!/usr/bin/env bash
set -euo pipefail

# Builds the GitHub Pages artifact for atomandbits.com. The site is the
# repository as it stands, except that claimsnative/ is served from
# claimsnative.com: every Claims Native page here becomes a redirect stub to
# the same path there, and the pages claimsnative.com retired in _redirects
# send readers to the pages that replaced them. GitHub Pages cannot send a
# 301; an immediate meta refresh with a canonical link is read the same way.

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_dir/claimsnative"
redirects="$source_dir/cloudflare-pages/_redirects"
output_dir="${1:-}"
canonical_origin="https://claimsnative.com"

if [[ -z "$output_dir" ]]; then
  echo "Usage: $0 OUTPUT_DIR" >&2
  exit 1
fi

if [[ -e "$output_dir" ]]; then
  echo "Output path already exists: $output_dir" >&2
  exit 1
fi

mkdir -p "$output_dir"
output_dir="$(cd "$output_dir" && pwd)"
if [[ "$output_dir" == "$repo_dir" || "$output_dir" == "$repo_dir"/* ]]; then
  rmdir "$output_dir"
  echo "Write the build outside the repository: $output_dir" >&2
  exit 1
fi
(cd "$repo_dir" && tar --exclude=./.git --exclude=./.github -cf - .) | tar -xf - -C "$output_dir"
rm -rf "$output_dir/claimsnative/cloudflare-pages" "$output_dir/claimsnative/cloudflare-www-redirect"
rm -f "$output_dir/claimsnative/404.html"

write_stub() {
  local file="$1" target="$2"
  mkdir -p "$(dirname "$file")"
  cat > "$file" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to claimsnative.com</title>
<link rel="canonical" href="$target">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=$target">
<script>location.replace("$target" + location.search + location.hash);</script>
</head>
<body>
<p>This page has moved to <a href="$target">$target</a>.</p>
</body>
</html>
HTML
}

# Live Claims Native pages: claimsnative/<path>/index.html -> claimsnative.com/<path>/
while IFS= read -r -d '' page; do
  relative="${page#"$source_dir"/}"
  [[ "$relative" == "404.html" ]] && continue
  path="${relative%index.html}"
  write_stub "$output_dir/claimsnative/$relative" "$canonical_origin/$path"
done < <(find "$source_dir" -name '*.html' -not -path '*/cloudflare-*' -print0)

# Retired pages, from the same _redirects file claimsnative.com serves.
while read -r from to status; do
  [[ "$status" == "301" && "$from" == /* && "$from" != /claimsnative* && "$from" != *'*'* ]] || continue
  path="${from%index.html}"
  path="${path%/}"
  file="$output_dir/claimsnative$path/index.html"
  [[ -e "$file" ]] && continue
  write_stub "$file" "$canonical_origin$to"
done < "$redirects"

echo "Built atomandbits.com Pages site at $output_dir"

#!/usr/bin/env python3
"""Bind browser evidence to the source inputs and exact built assets."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

repo = Path(__file__).resolve().parents[1]
output = Path(sys.argv[1]).resolve()
inputs = ['claimsnative', 'scripts/build-claimsnative-pages.sh', 'scripts/claimsnative-build-manifest.py']

def git(*args):
    return subprocess.check_output(['git', '-C', str(repo), *args]).decode().strip()

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

names = set(filter(None, git('ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', *inputs).split('\0')))
source = {
    name: digest(repo / name) for name in sorted(names)
    if (repo / name).is_file() and not {'.claude', '.git', 'node_modules'}.intersection(Path(name).parts)
}
files = {
    path.relative_to(output).as_posix(): digest(path)
    for path in sorted(output.rglob('*'))
    if path.is_file() and path.name != 'build-manifest.json'
}
identity = hashlib.sha256(json.dumps(files, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
tracked = set(filter(None, git('ls-files', '-z', '--', *inputs).split('\0')))
clean = subprocess.run(['git', '-C', str(repo), 'diff', '--quiet', 'HEAD', '--', *inputs]).returncode == 0 and set(source) <= tracked
manifest = {
    'source_revision': git('rev-parse', 'HEAD'),
    'source_inputs_clean': clean,
    'build_environment': sys.argv[2],
    'source_sha256': source,
    'artifact_sha256': files,
    'artifact_id': identity,
}
(output / 'build-manifest.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')

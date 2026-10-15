import json
from pathlib import Path
import subprocess
import tempfile
import unittest

REPO=Path(__file__).resolve().parents[2]
class BuildIdentity(unittest.TestCase):
    def test_manifest_binds_asset_bytes_and_environment(self):
        with tempfile.TemporaryDirectory() as temp:
            output=Path(temp)/'site'
            subprocess.run(['bash',str(REPO/'scripts/build-claimsnative-pages.sh'),str(output),'production'],check=True,stdout=subprocess.DEVNULL)
            manifest=json.loads((output/'build-manifest.json').read_text())
            self.assertEqual(manifest['build_environment'],'production')
            self.assertIn('growth.js',manifest['artifact_sha256'])
            self.assertIn('claimsnative/growth.js',manifest['source_sha256'])
            subprocess.run(['python3',str(REPO/'scripts/check-claimsnative-growth.py'),str(output)],check=True,stdout=subprocess.DEVNULL)
            (output/'growth.js').write_text((output/'growth.js').read_text()+'\n// changed bytes\n')
            result=subprocess.run(['python3',str(REPO/'scripts/check-claimsnative-growth.py'),str(output)],capture_output=True)
            self.assertNotEqual(result.returncode,0)
            self.assertIn(b'Built assets do not match',result.stderr)
if __name__=='__main__':unittest.main()

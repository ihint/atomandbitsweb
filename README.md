# Atom & Bits Website

**Live site:** [atomandbits.com](https://atomandbits.com)

Ian Harman's personal site: hard systems in healthcare and finance, built so people use them. It offers founders and operators a Product & AI assessment, an Agent workflow pilot, and Fractional leadership, and introduces Corridor Robotics.

## Edit

The pages are static HTML. There is no build step.

- `index.html` - homepage; copy it to `atom-bits-website.html` after every change
- `site.css` - the one stylesheet; colors are custom properties at the top
- `site.js` - mobile menu, sample workflow, contact form, click tracking
- `worker/index.js` - the Cloudflare Worker behind the contact form
- `_redirects` - 301s for moved or retired URLs
- `.assetsignore` - repository files Cloudflare must not serve; add anything new at the root that is not part of the site
- `images/` - photos; see `images/README.md` for the expected files

Keep the nav and footer the same on every page.

## Run locally

```bash
npx wrangler@4.151.3 dev
```

Open http://127.0.0.1:8787. The contact form works locally; instead of sending, the dev server writes each email under `.wrangler/tmp/email/`.

## Test

```bash
node --test scripts/site.test.mjs scripts/contact-worker.test.mjs
```

The site checks cover internal links and anchors, redirects, files kept off the web, cut phrases, the homepage mirror, page basics, and the facts table. The Worker tests cover the form's validation, spam trap, origin check, and email.

## Deploy

GitHub Actions runs the tests on every pull request and deploys `main` to the Cloudflare Worker `atomandbits-site`.

One-time move from GitHub Pages to Cloudflare:

1. In Cloudflare Email Service, onboard the subdomain notify.atomandbits.com for sending (`npx wrangler@4.151.3 email sending enable notify.atomandbits.com`) so `website@notify.atomandbits.com` can send, and verify `Ian@atomandbits.com` as a destination. Using a subdomain leaves the apex SPF and MX records for iCloud mail untouched.
2. Create a Cloudflare API token that can edit Workers, and add it as `CLOUDFLARE_API_TOKEN` in a GitHub environment named `atomandbits-production`. The repository variable `CLOUDFLARE_ACCOUNT_ID` already exists for Claims Native.
3. Merge to `main` or run `npx wrangler@4.151.3 deploy`. Check the site on its workers.dev address and send one test message.
4. `wrangler.jsonc` attaches atomandbits.com and www.atomandbits.com to the Worker as custom domains; the Worker sends www to the bare domain. The first deploy with them replaces the GitHub Pages DNS records.
5. Turn off GitHub Pages for this repository.

Claims Native builds from `claimsnative/` and deploys to [claimsnative.com](https://claimsnative.com) through its own workflow. Run `bash scripts/test-claimsnative-pages.sh` before a Claims Native release. That workflow uses the `claimsnative-production` environment.

---

*Questions? Email Ian@atomandbits.com.*

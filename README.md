# Atom & Bits Website

**Live Site:** [atomandbits.com](https://atomandbits.com)

Atom & Bits is Ian Harman's product and technology practice. The site connects his founder and operating results, applied AI work, and approach to working with people.

## Quick Start for Editing

The site uses static HTML, CSS, and JavaScript. No build step is required.

### Main File
- `index.html` - The live static website
- `atom-bits-website.html` - Historical mirror of the live page; keep it synced with `index.html`
- `service-pages.css` - Base styles for the main site and specialist pages
- `site.css` - Shared navigation and the personal website styles
- `site.js` - Mobile navigation and the illustrative agent walkthrough

### Making Changes

1. **Text Content**: Edit directly in `index.html`
2. **Colors**: Modify the CSS custom properties in `service-pages.css`
3. **Styling**: Update `site.css` for shared navigation and personal pages
4. **Functionality**: Update `site.js`; keep content and navigation usable without JavaScript
5. **Mirror file**: Copy `index.html` to `atom-bits-website.html` after content or style changes

### Color Scheme
The website uses a restrained executive palette aligned to Ian's CTO/founder positioning:
- `--ink`: #111827
- `--navy`: #1f4e79
- `--accent`: #ad5735
- `--blue-soft`: #e7eef7
- `--blue-wash`: #f2f5f9
- `--paper`: #fbfaf6
- `--line`: #d7dee8

### Sections to Customize
1. **Opening**: Ian's position and shared approach to the deliverable
2. **Selected work**: Founder, clinical AI, enterprise, and commercial cases
3. **Building now**: Claims Native and internal agent work, with evidence limits
4. **Work with me**: Assessment, agent workflow pilot, and product/technology leadership
5. **How I work**: Questions, joy, curiosity, and shared understanding
6. **Contact**: Email, phone, LinkedIn, and company details

The main offer routes are `/ai-fit-review/`, `/agent-workflows/`, and
`/product-technology-leadership/`. `/how-i-work/` explains Ian's approach.
Keep the existing healthcare routes available for visitors and search links.
The agent walkthrough is an illustration using sample content; it does not
connect to a live agent or perform an external action.

### Local Development
Run `python3 -m http.server 4173 --bind 127.0.0.1` in the project folder,
then open `http://127.0.0.1:4173/`. A server is needed for root-relative links.

### Deployment
The site auto-deploys to [atomandbits.com](https://atomandbits.com) when changes are pushed to the main branch.

Claims Native builds from `claimsnative/` and deploys to
[claimsnative.com](https://claimsnative.com) through the separate Cloudflare
workflow. Run `bash scripts/test-claimsnative-pages.sh` before release. The
workflow requires the `CLOUDFLARE_ACCOUNT_ID` repository variable and a narrow
`CLOUDFLARE_API_TOKEN` secret in the `claimsnative-production` environment.

### Technical Notes
- Responsive design using CSS Grid and Flexbox
- Native disclosure menus with keyboard support
- Sample walkthrough with a readable fallback when JavaScript is disabled
- No build process or dependencies required
- Optimized for performance and SEO

---

*Questions? Contact Ian at Ian@atomandbits.com*

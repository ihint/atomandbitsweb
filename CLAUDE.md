# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is Ian Harman's Atom & Bits website. It presents his work, approach, and offers in product, technology, and applied AI.

## Project Structure

- `index.html` - Static homepage
- `atom-bits-website.html` - Historical mirror; keep synced with `index.html`
- `site.css`, `site.js` - Shared styles, mobile navigation, and sample workflow controls
- `service-pages.css` - Base styles shared with the healthcare pages
- `how-i-work/`, `ian-harman/` - Ian's approach and background
- `ai-fit-review/`, `agent-workflows/`, `product-technology-leadership/` - Three offers
- `work/` - Career case studies
- No build system or package.json - pure HTML/CSS/JS

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS custom properties, CSS Grid, Flexbox
- **Motion**: CSS scrolling with reduced-motion support
- **Icons**: Inline SVG icons
- **Responsive**: Mobile-first responsive design

## Key Features

- **Static Pages**: Each route has its own HTML file
- **Navigation**: Anchor links and a native mobile menu work without JavaScript
- **Sample Workflow**: JavaScript switches steps; all steps remain readable without it
- **Responsive Grid Layouts**: CSS Grid for case studies and services
- **CSS Custom Properties**: Color theming system using CSS variables
- **Executive Visual System**: Ink, navy, paper, copper accents, crisp rules, restrained 8px radii

## Content Sections

1. **Opening**: Ian brings business, strategy, product, and technology together
2. **Selected Work**: Sourced career results with each role and metric scoped
3. **Current Work**: Claims Native and agent workspaces, with their development stage stated
4. **Offers**: Assessment, agent workflow pilot, and product/technology leadership
5. **Approach**: Joy, curiosity, questions, and shared understanding of the deliverable
6. **Contact**: Email, phone, and LinkedIn

## Development Notes

- The website uses a color theme defined in CSS custom properties (`--ink`, `--navy`, `--blue-soft`, `--blue-wash`, `--line`, etc.)
- The design follows Ian's CTO/founder aesthetic: clear, evidence-led, editorial, and less rounded than a generic SaaS landing page
- Use the Atom & Bits navy, paper, and copper palette in Claims Native. Keep the serif product wordmark to distinguish the product.
- Selected work should stay evidence-led and avoid unsupported metrics or hype
- No external dependencies or build process required

## Deployment

Serve the repository root with `python3 -m http.server 4173 --bind 127.0.0.1` for local review. GitHub Pages deploys the repository on pushes to `main`; use a review branch for unpublished changes. Keep the separate Claims Native deployment workflow intact.

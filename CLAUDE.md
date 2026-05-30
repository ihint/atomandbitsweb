# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal website for Ian Harman's consultancy "Atom & Bits" - a single-page HTML website focused on healthcare infrastructure, product and technology leadership, AI-enabled operations, provider networks, and founder-grade execution.

## Project Structure

- `index.html` - Live static website with inline CSS and JavaScript
- `atom-bits-website.html` - Historical mirror; keep synced with `index.html`
- No build system or package.json - pure HTML/CSS/JS

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS custom properties, CSS Grid, Flexbox
- **Animations**: CSS animations, Intersection Observer API
- **Icons**: Inline SVG icons
- **Responsive**: Mobile-first responsive design

## Key Features

- **Single Page Application**: All content in one HTML file
- **Smooth Scrolling Navigation**: JavaScript-powered smooth scrolling between sections
- **Intersection Observer Animations**: Fade-in animations triggered by scroll
- **Responsive Grid Layouts**: CSS Grid for case studies and services
- **CSS Custom Properties**: Color theming system using CSS variables
- **Executive Visual System**: Navy, white, light-blue panels, crisp rules, restrained 8px radii

## Content Sections

1. **Hero Section**: Positioning, proof points, and operating-range panel
2. **Services Section**: Fractional CTO/CPO, healthcare infrastructure, AI operations, and product-to-market translation
3. **Selected Work Section**: TheraMatch/TPN.health, One to One Health, BCBST, PerfectServe, Paragon, and CraftingCopy
4. **Approach Section**: Core operating philosophy
5. **Contact Section**: Contact information and social links

## Development Notes

- The website uses a color theme defined in CSS custom properties (`--ink`, `--navy`, `--blue-soft`, `--blue-wash`, `--line`, etc.)
- All animations are CSS-based with JavaScript triggers
- The design follows Ian's updated resume aesthetic: executive, crisp, navy/white, evidence-led, and less rounded than a generic SaaS landing page
- Selected work should stay evidence-led and avoid unsupported metrics or hype
- No external dependencies or build process required

## Deployment

This is a static website that can be deployed to any web server by simply uploading the HTML file.

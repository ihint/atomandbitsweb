# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal website for Ian Harman's consultancy "Atom & Bits" - a single-page HTML website focused on humanizing digital transformation and product strategy services.

## Project Structure

- `atom-bits-website.html` - Complete single-page website with inline CSS and JavaScript
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
- **Gradient Design System**: Consistent gradient usage throughout

## Content Sections

1. **Hero Section**: Introduction with animated background
2. **About Section**: Personal background and statistics
3. **Services Section**: Four main service offerings
4. **Philosophy Section**: Core business philosophy
5. **Case Studies Section**: Four detailed project case studies
6. **Contact Section**: Contact information and social links

## Development Notes

- The website uses a color theme defined in CSS custom properties (`--primary`, `--accent`, `--warm`, etc.)
- All animations are CSS-based with JavaScript triggers
- The design follows a "humanizing digital" philosophy with warm, approachable styling
- Case studies include metrics, achievements, and technology tags
- No external dependencies or build process required

## Deployment

This is a static website that can be deployed to any web server by simply uploading the HTML file.
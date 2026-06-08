# CleanBooks Consulting

Marketing website for **CleanBooks Consulting** — fast, accurate reconciliation and accounting services for modern businesses, with a focus on marketplace reconciliation, bookkeeping, and dispute resolution support for D2C brands.

🌐 Live site: [www.cleanbooksconsulting.net](https://www.cleanbooksconsulting.net)

## Overview

A static, multi-page website built with plain HTML, CSS, and JavaScript. It uses Bootstrap for layout, [AOS](https://michalsnik.github.io/aos/) for scroll animations, and Google Fonts (Inter & Lato). SEO is handled via meta tags, Open Graph / Twitter Card metadata, and JSON-LD structured data.

## Pages

| Page | Description |
|------|-------------|
| [index.html](index.html) | Home — hero, value proposition, and overview |
| [services.html](services.html) | Services — how we help, advantages, and experience |
| [about-us.html](about-us.html) | About the company |
| [contact-us.html](contact-us.html) | Contact details and enquiry |

## Project structure

```
.
├── index.html              # Home
├── services.html           # Services
├── about-us.html           # About
├── contact-us.html         # Contact
├── css/
│   ├── style.css           # Custom styles
│   ├── bootstrap.min.css   # Bootstrap
│   └── aos.min.css         # AOS animations
├── js/
│   ├── main.js             # Site interactions
│   ├── bootstrap.bundle.min.js
│   └── aos.min.js
├── images/                 # Logos, icons, and content imagery
└── build_letterhead.py     # Generates branded letterhead (Word + PDF)
```

## Running locally

No build step is required. Open `index.html` directly in a browser, or serve the folder for clean relative paths:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Letterhead generator

`build_letterhead.py` generates the company letterhead as Word (`.docx`) and PDF files. It requires `python-docx`, `reportlab`, and `Pillow`:

```bash
pip install python-docx reportlab Pillow
python3 build_letterhead.py
```

## Deployment

The site is static and can be hosted on any static host (GitHub Pages, Netlify, Vercel, S3, etc.). Deploy by serving the repository root.

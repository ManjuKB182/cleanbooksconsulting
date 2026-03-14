# CleanBooks Consulting — Website Build Plan

## Context
Building a new static website for **CleanBooks Consulting**, a reconciliation & accounting support firm. The reference site (gurujana.com) was analyzed for its tech stack. This plan keeps its strengths (lightweight static HTML, Bootstrap grid, scripts at bottom of body, responsive design) while upgrading every identified red flag.

**Business**: CleanBooks Consulting — reconciliation, bookkeeping, and dispute resolution services for D2C brands and businesses.
**Owner contact**: manjunathms@cleanbooksconsulting.net | 9008382748

---

## Pages (4 pages)

| File | Content |
|---|---|
| `index.html` | Home — hero, tagline, services preview, advantages |
| `about-us.html` | About Us — company story, NAKAD collaboration, objective |
| `services.html` | Our Services — 6 services + 4 advantages + experience |
| `contact-us.html` | Contact Us — form, email, phone, WhatsApp, LinkedIn |

---

## Tech Stack — Upgraded from GuruJana Reference

### What we KEEP (strengths)
- Static HTML5 — lightweight, fast, no CMS overhead
- Multi-page architecture
- Bootstrap grid system
- Google Fonts
- Scripts loaded at bottom of `<body>`
- Responsive design with media queries

### What we UPGRADE (red flags fixed)

| GuruJana (Old) | CleanBooks (New) | Reason |
|---|---|---|
| jQuery 1.11.2 | **Removed entirely** | Bootstrap 5 doesn't need it; Vanilla JS covers all needs |
| Bootstrap 3 | **Bootstrap 5.3** | Modern, no jQuery dep, better grid, utilities, components |
| Owl Carousel (jQuery) | **Not needed** | Content doesn't require a slider |
| Revolution Slider | **CSS Hero section** | Simple, clean hero with no plugin dependency |
| Magnific Popup (jQuery) | **Bootstrap 5 modals** | Built-in, no extra library |
| jQuery Validate | **HTML5 native + Vanilla JS** | No library needed for simple contact form |
| Empty meta description | **Full SEO meta tags** | Proper description, keywords, author |
| No Open Graph tags | **OG tags on every page** | Social media sharing previews |
| No Twitter Card | **Twitter Card meta** | Twitter/X link previews |
| No JSON-LD | **LocalBusiness schema** | Google rich results for business |
| No analytics | **GA4 placeholder** | Ready to activate with tracking ID |
| `maximum-scale=1` viewport | **Removed** | Accessibility fix (WCAG 1.4.4) |
| GIF logo images | **SVG or WebP** | Modern, scalable, smaller file size |
| No lazy loading | **`loading="lazy"`** on all images | Performance improvement |
| Google Fonts old API | **Google Fonts v2 API** | Faster loading with `display=swap` |
| Animate.css | **AOS.js** (Animate On Scroll) | Better scroll-triggered animations, lightweight |

---

## File Structure

```
CleanBooks/
├── index.html
├── about-us.html
├── services.html
├── contact-us.html
│
├── css/
│   ├── bootstrap.min.css        (Bootstrap 5.3)
│   ├── aos.min.css              (Animate On Scroll)
│   └── style.css                (Custom styles)
│
├── js/
│   ├── bootstrap.bundle.min.js  (Bootstrap 5.3 + Popper bundled)
│   ├── aos.min.js               (AOS library)
│   └── main.js                  (Custom Vanilla JS)
│
└── images/
    ├── logo.svg
    ├── favicon.png
    └── hero-bg.webp
```

---

## HTML `<head>` Template (every page)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="CleanBooks Consulting — Fast & Accurate Reconciliation and Accounting Services for Modern Businesses.">
  <meta name="keywords" content="reconciliation, bookkeeping, marketplace reconciliation, D2C, accounting support">
  <meta name="author" content="CleanBooks Consulting">

  <!-- Open Graph -->
  <meta property="og:title" content="CleanBooks Consulting">
  <meta property="og:description" content="Fast & Accurate Reconciliation & Accounting Services for Modern Businesses.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.cleanbooksconsulting.net">
  <meta property="og:image" content="images/og-preview.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="CleanBooks Consulting">
  <meta name="twitter:description" content="Fast & Accurate Reconciliation & Accounting Services.">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="images/favicon.png">

  <!-- Google Fonts v2 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">

  <!-- CSS -->
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/aos.min.css">
  <link rel="stylesheet" href="css/style.css">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CleanBooks Consulting",
    "email": "manjunathms@cleanbooksconsulting.net",
    "telephone": "+919008382748",
    "url": "https://www.cleanbooksconsulting.net",
    "description": "Reconciliation and accounting support services for modern businesses."
  }
  </script>

  <title>CleanBooks Consulting | [Page Name]</title>
</head>
```

---

## Page-by-Page Content Plan

### 1. `index.html` — Home
- **Navbar**: Logo + Home, About Us, Services, Contact Us
- **Hero Section**: Full-width banner — headline, subheadline, CTA button "Get In Touch"
  - Headline: *Fast & Accurate Reconciliation & Accounting Services for Modern Businesses*
  - Subheadline: *Helping businesses maintain clean and accurate books through structured reconciliations, discrepancy resolution, and reliable accounting support.*
- **Services Preview**: 3-column grid — icons + short descriptions
- **Why CleanBooks**: 4 advantages (Quick, Affordable, Flexible, Quality)
- **CTA Banner**: "Ready to clean up your books?" → Contact button
- **Footer**: Copyright 2026, email, phone, nav links

### 2. `about-us.html` — About Us
- **Page header** with title
- **Company story** — what CleanBooks does and who it serves
- **Our Objective** highlight box — *"Help businesses maintain clean books, close reconciliation gaps quickly, and strengthen their accounting processes."*
- **NAKAD collaboration** callout
- **Founder experience** card section

### 3. `services.html` — Our Services
- **Page header**
- **6 Service cards** in Bootstrap grid (1-col mobile, 2-col tablet, 3-col desktop):
  1. Financial Reconciliation — End-to-end reconciliation across internal systems, vendors, customers
  2. Marketplace Reconciliation — Settlements, deductions, claims, discrepancies with marketplace platforms
  3. Vendor & Customer Reconciliation — Ledger gaps and balance confirmations
  4. Dispute Resolution Support — Identifying and resolving financial discrepancies
  5. Bookkeeping Support — Clean, organized, reconciliation-ready accounting records
  6. Small Finance & Data Tasks — Quick reconciliations, data cleanup, ledger reviews (with bullet list)
- **Our Advantages** section (4-col grid with icons)
- **Experience** section — Founder bio + NAKAD collaboration

### 4. `contact-us.html` — Contact Us
- **Page header**
- **Contact info cards**: Email, Phone/WhatsApp, LinkedIn
- **Contact form**: Name, Company, Email, Message, Send Inquiry button
  - HTML5 validation (`required`, `type="email"`)
  - Form action via **Web3Forms** (free, no backend needed)
- **Footer**

---

## Custom CSS Strategy (`style.css`)

**Color palette** (professional, clean, finance-focused):
```css
:root {
  --primary:    #1B5E8C;  /* deep blue — trust, finance */
  --accent:     #27AE60;  /* green — clean, accurate */
  --text:       #2C3E50;
  --bg-light:   #F8F9FA;
  --white:      #FFFFFF;
}
```

**Typography**: Inter for headings, Lato for body text

---

## JavaScript (`main.js`) — Vanilla ES6+

```js
// Dynamic copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// Navbar active link highlighting
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

// Back to top button
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop.style.display = window.scrollY > 100 ? 'flex' : 'none';
});

// AOS init
AOS.init({ duration: 700, once: true });
```

---

## Contact Form — Web3Forms Integration

Free service, no backend required. Sign up at web3forms.com to get an access key.

```html
<form action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="text" name="company" placeholder="Company Name">
  <input type="email" name="email" placeholder="Email Address" required>
  <textarea name="message" placeholder="Your Message" required></textarea>
  <button type="submit" class="btn btn-primary">Send Inquiry</button>
</form>
```

---

## Accessibility Checklist
- [x] `viewport` — `maximum-scale=1` removed
- [x] All images have meaningful `alt` attributes
- [x] `loading="lazy"` on all non-hero images
- [x] Sufficient color contrast (blue #1B5E8C on white passes AA)
- [x] Keyboard-navigable navbar (Bootstrap 5 built-in)
- [x] Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`

---

## Verification Checklist
- [ ] Open each `.html` in browser — check layout, fonts, nav links
- [ ] Test contact form via Web3Forms (check email delivery)
- [ ] Mobile responsiveness — Chrome DevTools device toggle
- [ ] Validate HTML at validator.w3.org
- [ ] Check OG tags with Facebook Sharing Debugger
- [ ] Check Twitter Card with Twitter Card Validator
- [ ] Verify JSON-LD with Google Rich Results Test
- [ ] Lighthouse audit — target 90+ on Performance, Accessibility, SEO, Best Practices

# Khadeeja Designs - Website v3

## File structure

```
khadeeja-designs/
├── index.html            Home
├── about/                Studio overview and brand story
├── explore/              Portfolio and design pages
│   ├── index.html        Portfolio grid
│   └── designs/
│       ├── index.json    Master list of product IDs
│       └── <product-id>/ Product JSON, images and static design page
├── contact/              Enquiry form (`index.html`)
├── thankyou/             Post-submission confirmation (`index.html`)
├── faq/                  Full FAQ page (`index.html`)
├── privacy/              Privacy policy (`index.html`)
├── shared.css            Design system - shared by all pages
├── shared-nav.js         Nav + footer injection for all pages
├── site-config.json      WhatsApp, reply window, ordering steps and testimonials
├── netlify.toml          Clean URL config for Netlify
│
├── blog/
│   ├── index.html        Blog listing
│   └── how-to-choose-aari-embroidery-bridal-blouse/
│       └── index.html   Published article
│
└── images/
    ├── blog/             Cover images for blog posts
    └── portfolio/        Any additional portfolio images
```

---

## Setup checklist (do in this order)

### 1. Analytics and privacy
Microsoft Clarity is configured on the homepage, Explore, Contact, FAQ, Blog,
the live blog article, and product detail pages. Google Analytics and Meta
Pixel are optional and are configured only when a deployment supplies real IDs
in `site-config.json` under `analytics.gaMeasurementId` and
`analytics.metaPixelId`. Leave them blank until the owner provides verified
IDs. The event hooks call the GA4 and Meta Pixel globals when available; add
real measurement IDs through the approved deployment setup before expecting
event delivery. Decide consent behavior and update the privacy policy before
enabling either service.

### 2. Form endpoint
The enquiry endpoint is configured in `contact/index.html`.
Update the Formspree endpoint there if the form account changes.

### 3. Update site-wide conversion content
WhatsApp prefilled messages are generated in `shared-nav.js` based on the
current page, including the design name on product pages and article title on
blog posts.
Update `site-config.json` to change the WhatsApp number (digits only, with
country code), reply window, four ordering steps or permitted testimonials.
Keep `testimonials` empty until each review and photo has customer permission.
The Netlify build runs `tools/sync-reply-window.js` to write the configured
reply window into the FAQ, contact and product-page HTML before publishing.
`tools/generate-sitemap.js` also rebuilds `sitemap.xml` from the live product and
blog folders so new pages are indexed automatically without manual drift.
Other pages with `[data-reply-window]` placeholders are filled by
`shared-nav.js` when their JavaScript loads.
The default design prices are single prices; set both `originalPrice` and a
valid future `offerEndsOn` date in a product's `product.json` to show a timed
offer.

### 4. Update contact details
Keep the business address, Instagram handle, and contact email consistent
across the contact page, structured data, and privacy policy.

### 5. Add product images
For each folder in `explore/designs/`, keep the original image files and list
their exact names in `product.json`. Add a `.webp` version beside each image
using the same filename stem. The Explore cards, product pages, and thank-you
page load WebP first and fall back to the original file.
Add responsive WebP derivatives named `<stem>_480w.webp`, `<stem>_720w.webp`,
and `<stem>_960w.webp` for every product image. Use `srcset` and `sizes` so
mobile and desktop browsers can select the appropriate image URL; retain the
full-size WebP and original image as the largest candidate and fallback.

The site self-hosts its Cormorant Garamond and DM Sans WOFF2 fonts in `fonts/`
to avoid a render-blocking Google Fonts stylesheet. Keep the included OFL
license files with those font assets.

### 6. Add blog cover image
Save each cover image inside its article folder, using a lowercase,
hyphen-separated filename that describes the article topic. Reference that
file in the article hero, Open Graph and Twitter metadata, and Article JSON-LD.
Provide `_480w.webp`, `_720w.webp`, `_960w.webp`, and full-size `_1536w.webp`
variants for the hero `srcset`; use the full-size WebP for social and schema
metadata. Keep descriptive alt text and the image's actual intrinsic dimensions.

---

## How to add a new product

1. Create folder: `explore/designs/my-new-product/`

2. Add `product.json`:
```json
{
  "id": "my-new-product",
  "tag": "Full Product Name for Enquiry",
  "category": "bridal",
  "title": "Full Product Name",
  "originalPrice": null,
  "offerEndsOn": null,
  "newPrice": "INR 6,990",
  "imageAlt": "Custom descriptive Aari embroidery alt text",
  "summary": "One sentence shown prominently on the product page.",
  "description": "Longer paragraph describing the design and occasion.",
  "specs": {
    "category": "Bridal Blouse",
    "workType": "Aari · Zardosi · Stone",
    "timeline": "14–21 days"
  },
  "images": ["Full Product Name Front.png", "Full Product Name Back.png"]
}
```

`category` must match an available Explore filter. Current values are
`bridal` or `designer`.

3. Add the original image files and matching `.webp` versions. List the
   original filenames in `product.json`; keep the first image as the card and
   product-page hero image.

4. Add the ID to `explore/designs/index.json` and add a matching design card
   to `explore/index.html`. The HTML card keeps the catalogue browsable if
   JavaScript or the product JSON request is unavailable.
```json
["bridal-zardosi", "temple-border", "couture-collar", "lotus-vine", "my-new-product"]
```

Done. Product appears in the grid and gets the URL: `/explore/designs/my-new-product/`

---

## How to add a new blog post

1. Copy `blog/how-to-choose-aari-embroidery-bridal-blouse/` to a new
   kebab-case folder under `blog/`, keeping `index.html` as the entry point.
3. Update in the new file:
   - `<title>` and `<meta name="description">`
   - `<meta property="og:title">` and `og:description`
   - `.post-meta` (category, date, read time)
   - `<h1 class="post-title">` and `.post-intro`
   - All `<article>` content
   - Add a descriptive image and 480w, 720w, 960w, and full-size WebP variants
     to the article folder. Use the variants in the hero `<picture>` `srcset`
     and update the Open Graph, Twitter, and Article JSON-LD image URLs.
   - Post byline at bottom
4. Add a card to `blog/index.html` pointing to the new folder URL
5. Update the "More from the blog" sidebar in the new post
6. The build regenerates `sitemap.xml` from the blog folders; no manual sitemap
   edit is needed. Run `node tools/generate-sitemap.js` locally to preview the
   generated sitemap before publishing.

---

## Netlify deployment (clean URLs)

The `netlify.toml` file handles clean URLs automatically.
After deploying:
- `/faq/` serves `faq/index.html` - no `.html` in the URL bar
- `/blog/` serves `blog/index.html`
- Legacy `/product?id=...` links redirect to the matching
  `/explore/designs/<product-id>/` page.
- Canonical domain stays `https://khadeejadesigns.in/`; the Netlify subdomain
  should redirect with a 301 to avoid duplicate host indexing.

To deploy:
1. Push this folder to a GitHub repo
2. Connect the repo to Netlify (netlify.com → Add new site → GitHub)
3. Build settings: Build command = leave blank, Publish directory = .
4. Deploy - Netlify reads netlify.toml automatically
5. After deployment, submit `https://khadeejadesigns.in/sitemap.xml` in the
   verified Google Search Console property. This requires owner account access.

---

## Tracking status

Microsoft Clarity is active on selected pages, as listed in the setup
checklist. Google Analytics and Meta Pixel IDs are not configured in this
repository, so the event hooks deliver only when their real tags are available
in the deployment. Confirm deployment-level tag and consent settings; verify
event delivery and avoid counting a successful enquiry more than once.

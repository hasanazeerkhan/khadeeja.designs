# Khadeeja Designs - Website v3

## File structure

```
khadeeja-designs/
├── index.html            Home
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
├── netlify.toml          Clean URL config for Netlify
│
├── blog/
│   ├── index.html        Blog listing
│   └── how-to-choose-aari-embroidery-bridal-blouse.html
│
└── images/
    ├── blog/             Cover images for blog posts
    └── portfolio/        Any additional portfolio images
```

---

## Setup checklist (do in this order)

### 1. Replace YOUR_PIXEL_ID
Search all HTML files for `YOUR_PIXEL_ID` and replace with your Meta Pixel ID.
Files to update: index, explore, product, contact, thankyou, faq, privacy,
blog/index, blog/how-to-choose-aari...

### 2. Replace YOUR_GA4_ID
Search all HTML files for `YOUR_GA4_ID` and replace with your GA4 Measurement ID (G-XXXXXXXXXX).
Same files as above.

### 3. Form endpoint
The enquiry endpoint is configured in `contact/index.html`.
Update the Formspree endpoint there if the form account changes.

### 4. Update contact details
Keep the Instagram handle and contact email consistent across the site.

### 5. Add product images
For each folder in explore/designs/:
- main.jpg - square, min 800×800px (shown in grid)
- 2.jpg, 3.jpg - detail shots (shown in product page gallery)

### 6. Add blog cover image
Save to: images/blog/bridal-blouse-guide.jpg
Recommended size: 1400×500px, landscape

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
  "oldPrice": "INR 7,990",
  "newPrice": "INR 6,990",
  "saving": "1,000",
  "rating": "4.9",
  "summary": "One sentence shown prominently on the product page.",
  "description": "Longer paragraph describing the design and occasion.",
  "specs": {
    "category": "Bridal Blouse",
    "workType": "Aari · Zardosi · Stone",
    "timeline": "14–21 days"
  },
  "images": ["main.jpg", "2.jpg", "3.jpg"]
}
```

`category` must match an available Explore filter. Current values are
`bridal` or `designer`.

3. Add images: main.jpg, 2.jpg, 3.jpg

4. Add the ID to `explore/designs/index.json`:
```json
["bridal-zardosi", "temple-border", "couture-collar", "lotus-vine", "my-new-product"]
```

Done. Product appears in the grid and gets the URL: `/explore/designs/my-new-product/`

---

## How to add a new blog post

1. Duplicate `blog/how-to-choose-aari-embroidery-bridal-blouse.html`
2. Rename it: `blog/your-post-title-here.html`
3. Update in the new file:
   - `<title>` and `<meta name="description">`
   - `<meta property="og:title">` and `og:description`
   - `.post-meta` (category, date, read time)
   - `<h1 class="post-title">` and `.post-intro`
   - All `<article>` content
   - Hero image src (add to images/blog/)
   - Post byline at bottom
4. Add a card to `blog/index.html` pointing to the new file
5. Update the "More from the blog" sidebar in the new post

Google will automatically discover and index the new post via your sitemap
(add sitemap.xml when you have 5+ posts - Netlify can auto-generate it).

---

## Netlify deployment (clean URLs)

The `netlify.toml` file handles clean URLs automatically.
After deploying:
- `/faq/` serves `faq/index.html` - no `.html` in the URL bar
- `/blog/` serves `blog/index.html`
- Legacy `/product?id=...` links redirect to the matching
  `/explore/designs/<product-id>/` page.

To deploy:
1. Push this folder to a GitHub repo
2. Connect the repo to Netlify (netlify.com → Add new site → GitHub)
3. Build settings: Build command = leave blank, Publish directory = .
4. Deploy - Netlify reads netlify.toml automatically

---

## Tracking funnel (Meta Ads retargeting)

| Page | URL | Pixel event | Audience to build |
|------|-----|-------------|-------------------|
| Home | / | PageView | Top of funnel |
| Explore | /explore | PageView | "Browsed portfolio" |
| Product | /explore/designs/<id>/ | ViewContent | "Viewed specific design" |
| Contact | /contact | PageView | "High intent" |
| Thank You | /thankyou | Lead (conversion) | Exclude from retargeting |

Recommended retargeting campaigns:
- Visited /explore but NOT /thankyou → "Browse our new arrivals"
- Visited /explore/designs/<id>/ but NOT /thankyou → Show the specific design they viewed
- Lookalike of /thankyou visitors → Find similar audiences to target

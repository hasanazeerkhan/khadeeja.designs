# Khadeeja Designs — Phase 2 SEO implementation report

Date: 31 October 2026  
Canonical domain: `https://khadeejadesigns.in/`

## Executive summary

The site has a sound clean-URL structure and dedicated product landing pages. Phase 2 work focused on crawlable internal discovery, duplicate legacy URL control, page metadata, local business context, article structured data, and image accessibility. No ranking or traffic outcome is promised; performance should be measured in Search Console and analytics after owner configuration.

## 1. Technical audit

| Issue | Affected page | Severity | Status / recommended fix |
|---|---|---:|---|
| Legacy `/product/` page is a redirect shell with generic metadata | `/product/` | Medium | Fixed with `noindex,follow` and canonical to `/explore/`; Netlify redirect remains in place. |
| Legacy query-based product renderer has generic head metadata and relies on JavaScript | `/explore/product.html` | High | Fixed for the legacy renderer with `noindex,follow`; clean static product URLs are the indexable landing pages. |
| Portfolio listing is rendered from JSON by JavaScript | `/explore/` | Medium | Accepted architecture; static product URLs are present in the sitemap and should remain the indexable targets. Consider server-rendered cards in a future performance pass. |
| Blog article had no Article schema | Blog article | Medium | Fixed. Article schema uses the canonical URL, visible title, author, dates and image. |
| Blog sidebar contained two `#` placeholder links | Blog article | Medium | Fixed to useful Explore and FAQ destinations. |
| Homepage had no explicit crawlable links to all core journeys in its HTML | `/` | Medium | Fixed with visible links to Explore, Blog, FAQ and Contact. |
| Placeholder GA4 and Meta Pixel IDs are present | Multiple pages | Medium | Not activated or replaced; owner must provide real IDs. Placeholder values must not be deployed as live measurement IDs. |
| No evidence of a completed Lighthouse/PageSpeed run in the repository | Site-wide | Medium | Owner/deployment action pending; run on mobile production URLs after deploy. |

Verified existing strengths: canonical `.in` URLs are used on the important pages, `robots.txt` points to the canonical sitemap and excludes `/thankyou/`, Netlify redirects preserve the custom domain, the sitemap contains the homepage, core pages, article and eight product pages, and product pages have unique Product schema.

## 2. Keyword and intent map

No reliable volume or difficulty source was available in the repository, so no search volume or difficulty numbers are invented.

| Primary keyword / theme | Intent | Recommended page | Priority |
|---|---|---|---:|
| Aari embroidery and bridal blouse designs in Trichy | Local / transactional | Homepage | High |
| Bridal Aari blouse designs | Transactional | Explore | High |
| Customised Aari blouse designs | Transactional | Explore, Contact | High |
| Aari embroidery blouse price | Transactional / research | Explore, FAQ | High |
| Aari work for silk sarees | Research / transactional | Explore, FAQ | Medium |
| Aari embroidery in Trichy | Local | Homepage, Contact | High |
| Bridal blouse embroidery in Trichy | Local / transactional | Homepage, Contact | High |
| Handmade Aari embroidery | Informational / commercial | Homepage, FAQ | Medium |
| Zardosi blouse designs | Transactional | Relevant product page, Explore | Medium |
| What is Aari embroidery? | Informational | FAQ, Blog | Medium |
| Aari vs Zardosi embroidery | Informational | FAQ, future article | Medium |
| How to maintain Aari embroidery | Informational | FAQ, future article | Medium |

## 3. Page-wise implementation

- Homepage keeps one clear H1, Trichy positioning, pan-India delivery language and enquiry discovery. It now has crawlable links to Explore, Blog, FAQ and Contact.
- Explore keeps its collection description, filters, product CTAs, FAQ content and descriptive client-rendered image alt text. Its static product URLs are in the sitemap.
- Product landing pages retain unique product-specific titles, descriptions, H1s, descriptions, prices and Product schema. Product facts that are uncertain remain qualified in the visible copy rather than being presented as confirmed claims.
- The blog article retains its useful guidance, now has Article schema and non-placeholder contextual links.
- Contact title/description and the existing visible Trichy address, email, Instagram and pan-India delivery information should be kept consistent if business details change.
- FAQ already covers ordering, customisation, pricing, Aari education, care and delivery, with links to Contact and Explore where useful.

## 4. Local SEO

Homepage LocalBusiness schema uses the existing visible business name, phone, Trichy address, website, service area and service types. Opening hours, ratings and reviews were not added. The owner should verify that the address and phone are current before publishing or creating a Google Business Profile.

Google Business Profile owner checklist:

1. Claim and verify the profile; do not create or edit it through an unauthorised party.
2. Use the real business name consistently.
3. Select the most accurate primary category and only genuinely applicable secondary categories.
4. Add the canonical website, verified phone, Trichy location/service area and accurate description.
5. Upload original studio, work-in-progress, finished blouse and packaging photographs.
6. Add genuine products/services and current enquiry information.
7. Ask real customers for honest reviews after completed orders; never fabricate or gate reviews.

## 5. Image SEO and performance

Existing product image files are large PNGs (roughly 2.2–2.5 MB each) and should be compressed or converted to WebP/AVIF in a deployment-safe future pass while retaining the originals and paths. Do not replace them blindly. Below-the-fold product and blog images should remain lazy-loaded; the primary hero image should be eager. Intrinsic dimensions should be retained or added to every image to reduce layout shift. A production Lighthouse/PageSpeed audit is still required.

## 6. Structured data and internal linking

Implemented or verified: LocalBusiness and WebSite schema on the homepage, Product schema on static product pages, Article schema on the live article, canonical `.in` URLs, product breadcrumbs in visible HTML, and descriptive links between the core sections. No ratings, reviews, opening hours, fake availability or promotional claims were added.

## 7. Search Console and analytics owner actions

- Verify the `khadeejadesigns.in` domain property.
- Submit `https://khadeejadesigns.in/sitemap.xml`.
- Inspect the homepage, Explore, FAQ, Blog, Contact and each clean product URL.
- Review indexing, crawl errors, discovered-but-not-indexed URLs and canonical selection. A sitemap entry is not proof of indexing.
- Supply the real GA4 Measurement ID and Meta Pixel ID before enabling tracking.
- Implement and test meaningful events: enquiry submission, Instagram click, product view and (where technically confirmed) completed enquiry. Page views are not conversions.
- Record organic sessions, impressions, clicks, average position, product visits, enquiries, Instagram clicks and conversion rate.

## 8. Files modified

- `index.html`
- `product/index.html`
- `explore/product.html`
- `blog/index.html`
- `blog/how-to-choose-aari-embroidery-bridal-blouse/index.html`
- `SEO-IMPLEMENTATION-REPORT.md`

## 9. Remaining issues

Real analytics IDs, production mobile performance measurements, image compression/modern-format derivatives, live HTTPS/redirect verification and Search Console indexing observations require deployment or owner credentials. The current client-rendered Explore grid is functional, but server-rendered product links would improve first-pass crawlability and resilience.

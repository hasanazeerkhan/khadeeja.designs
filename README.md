# Khadeeja Designs — Website v2

## File structure

```
khadeeja-designs/
├── index.html          Home page
├── explore.html        Product grid
├── product.html        Shared product detail (?id=product-id)
├── contact.html        Enquiry form
├── thankyou.html       Post-submission confirmation
├── shared.css          Nav, footer, buttons — shared across all pages
├── products/
│   ├── index.json      Master list of product IDs (edit to add/remove products)
│   ├── bridal-zardosi/
│   │   ├── product.json
│   │   ├── main.jpg    ← shown in the explore grid
│   │   ├── 2.jpg
│   │   └── 3.jpg
│   ├── temple-border/
│   │   └── ...
│   ├── couture-collar/
│   │   └── ...
│   └── lotus-vine/
│       └── ...
└── README.md
```

---

## Setup checklist

### 1. Add your WhatsApp number
Search for `918667454391` in all HTML files and replace with your number.
Format: country code + number, no + or spaces. Example: `919876543210`

### 2. Connect the enquiry form (Formspree — free)
1. Go to https://formspree.io and create a free account
2. Create a new form, copy the form ID (looks like `xpzgkwqr`)
3. In contact.html, replace `YOUR_FORM_ID` with your ID:
   `https://formspree.io/f/YOUR_FORM_ID`
4. You'll get an email for every enquiry with the customer's name, phone, design selected, and message

### 3. Add Meta Pixel
1. Go to Meta Events Manager and create a Pixel
2. Copy your Pixel ID (a 15-16 digit number)
3. In all 5 HTML files, replace `YOUR_PIXEL_ID` with your ID
4. The pixel fires:
   - PageView: on every page
   - ViewContent: when a product detail is viewed (includes product name, category, price)
   - Lead: when the enquiry form is submitted
   - Lead (again): on the thank you page — use this as your conversion event

### 4. Add Google Analytics 4
1. Go to Google Analytics and create a GA4 property
2. Copy your Measurement ID (format: G-XXXXXXXXXX)
3. In all 5 HTML files, replace `YOUR_GA4_ID` with your ID
4. GA4 events fired:
   - page_view: every page
   - view_item: product detail page
   - generate_lead: on form submit
   - conversion: on thank you page

### 5. Add your product images
For each product folder, add:
- `main.jpg` — square crop, min 800×800px, shown in the explore grid
- `2.jpg`, `3.jpg` — detail shots shown in the image gallery on product page

If an image is missing, the site gracefully shows a dark placeholder. Nothing breaks.

---

## How to add a new product

1. Create a new folder in `products/` — use a short hyphenated ID, e.g. `products/peacock-blouse/`

2. Add a `product.json` inside it:

```json
{
  "id": "peacock-blouse",
  "tag": "Peacock Motif Bridal Blouse",
  "category": "bridal",
  "title": "Peacock Motif Bridal Blouse",
  "oldPrice": "INR 7,990",
  "newPrice": "INR 6,990",
  "saving": "1,000",
  "rating": "4.9",
  "summary": "One-line description shown prominently on the product page.",
  "description": "Longer paragraph describing the design, occasion, technique, and comfort.",
  "specs": {
    "category": "Bridal Blouse",
    "workType": "Aari · Peacock motif · Stone",
    "timeline": "14–21 days"
  },
  "images": ["main.jpg", "2.jpg", "3.jpg"]
}
```

**category must be one of:** `bridal`, `saree`, `couture`

3. Add your images: `main.jpg`, `2.jpg`, `3.jpg` inside the folder

4. Open `products/index.json` and add the product ID:

```json
[
  "bridal-zardosi",
  "temple-border",
  "couture-collar",
  "lotus-vine",
  "peacock-blouse"
]
```

That's it. The product automatically appears in the explore grid and gets its own trackable URL:
`product.html?id=peacock-blouse`

---

## Tracking funnel (for Meta Ads retargeting)

| Page | URL | Pixel event | What to do in Meta |
|------|-----|-------------|-------------------|
| Home | index.html | PageView | Top of funnel audience |
| Explore | explore.html | PageView | "Browsed products" audience |
| Product detail | product.html?id=X | ViewContent | "Viewed specific product" audience |
| Contact | contact.html | PageView | "Showed intent" audience |
| Thank You | thankyou.html | Lead (conversion) | Confirmed lead — exclude from retargeting |

**Recommended Meta Ads audiences:**
- Retarget: visited explore.html but NOT thankyou.html → show "Browse our new arrivals" ad
- Retarget: visited product.html but NOT thankyou.html → show the specific design they viewed
- Lookalike: based on thankyou.html visitors → find similar people to target

---

## Tech note

The product pages use JavaScript `fetch()` to load JSON files, which requires a web server.
This already works on:
- VS Code Live Server (localhost:5500) ← what you're using now
- Any web hosting (Netlify, Vercel, shared hosting, etc.)

It does NOT work if you open the HTML files directly by double-clicking them (file:// protocol).
This is expected — just use Live Server or upload to hosting.

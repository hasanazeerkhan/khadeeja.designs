# Easy Content Management Guide

This guide is for non-technical people who want to update website content without code.

## 📝 How to Update Blog Posts

### Adding a New Blog Post

1. Open `public/blogs.json` file
2. Add a new object to the array. Copy this template:

```json
{
  "id": 7,
  "slug": "my-blog-title",
  "title": "My Blog Title",
  "excerpt": "Short summary of the blog post (shown in list)",
  "date": "December 2024",
  "readTime": "5 min read",
  "image": "/placeholder-1.svg",
  "content": "# Main Title\n\nYour content here...\n\n## Subtitle\n\nMore content..."
}
```

### Important Fields to Remember:

- **id**: Use the next number (7, 8, 9...)
- **slug**: Short URL-friendly name (use hyphens, no spaces)
- **title**: The blog post title
- **excerpt**: 1-2 sentence summary
- **date**: Month and year
- **readTime**: Estimated read time (e.g., "5 min read")
- **image**: Use `/placeholder-1.svg` or `/placeholder-2.svg` for now
- **content**: The full blog post (see formatting below)

### Content Formatting (Simple Markdown):

```
# Main Heading
## Subheading
### Sub-subheading

Regular paragraph text goes here.

- Bullet point one
- Bullet point two
- Bullet point three

**Bold text** for emphasis
*Italic text* for alternative emphasis
```

### Example Blog Post:

```json
{
  "id": 7,
  "slug": "wedding-season-2025",
  "title": "Getting Ready for Wedding Season 2025",
  "excerpt": "Plan your custom blouse design ahead of the big season.",
  "date": "January 2025",
  "readTime": "4 min read",
  "image": "/placeholder-1.svg",
  "content": "# Getting Ready for Wedding Season 2025\n\nWedding season is approaching fast! Here's what you need to know.\n\n## Plan Early\n\n- Book your design 2-3 months in advance\n- Discuss your vision with our team\n- Allow time for revisions\n\n## Popular Trends\n\n- Minimalist designs\n- Gold and silver combinations\n- Custom beadwork\n\n**Don't wait!** Contact us today to start your bridal journey."
}
```

---

## 🎨 How to Update Home Page Content

### About Section Questions

Edit in `pages/index.tsx`, find the sections with `<div className="min-h-[80vh]..."` and update:

- Who are we and what do we create? → First section
- What makes our Aari work special? → Second section
- Do we customize designs? → Third section
- etc.

### Contact Information

Edit `pages/index.tsx`, look for the contact section and update:
- Email address
- WhatsApp number
- Location

### Portfolio Section

The portfolio currently shows 9 items. To add more items, change this line in `pages/index.tsx`:

```tsx
{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
```

Change `9` to however many items you want (e.g., `18` for 18 items).

---

## 🔗 Important File Locations

| File | Purpose |
|------|---------|
| `public/blogs.json` | All blog post content and metadata |
| `pages/index.tsx` | Home page content |
| `pages/blog/index.tsx` | Blog listing page |
| `pages/blog/[slug].tsx` | Individual blog post page |
| `components/Navigation.tsx` | Top navigation menu |
| `components/WhatsAppButton.tsx` | WhatsApp button link |

---

## ⚠️ Important Notes

- **Always backup** `public/blogs.json` before making changes
- Use **proper JSON format** (commas, quotes, brackets)
- Use `\n` for line breaks in content
- **Slug must be unique** and URL-friendly (use hyphens only)
- **ID must be unique** and sequential

---

## 🆘 Common Issues

### Blog not appearing
- Check if comma is missing after the blog object
- Verify slug has no spaces (use hyphens instead)
- Make sure JSON syntax is correct

### Content not formatting correctly
- Double-check markdown syntax
- Use `\n\n` for paragraph breaks
- Verify bold/italic markers are correct: `**bold**` and `*italic*`

---

## 💡 Tips

- Use `\n` to create line breaks: `"content": "Line one\n\nLine two"`
- Keep excerpts to 1-2 sentences
- Use clear, readable blog post titles
- Include relevant keywords in titles and slugs

Need help? Contact the developer!

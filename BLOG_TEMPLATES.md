# Blog Post Templates

Copy and paste these templates to quickly add new blog posts to `public/blogs.json`

## Template 1: Basic Blog Post

```json
{
  "id": 7,
  "slug": "post-url-name",
  "title": "Your Blog Post Title Here",
  "excerpt": "A brief 1-2 sentence description that appears in the blog list.",
  "date": "January 2025",
  "readTime": "5 min read",
  "image": "/placeholder-1.svg",
  "content": "# Main Title of Your Post\n\nThis is your introduction paragraph. Write here about the topic.\n\n## First Section\n\nHere you can write more details about the first topic.\n\n- Point one\n- Point two\n- Point three\n\n## Second Section\n\nAnother section with more information.\n\n**Bold text** stands out for emphasis. *Italic text* is used for alternative emphasis.\n\n## Conclusion\n\nWrap up your blog post with final thoughts."
}
```

## Template 2: How-To Guide

```json
{
  "id": 8,
  "slug": "how-to-care-for-blouse",
  "title": "How to Care for Your Hand-Embroidered Blouse",
  "excerpt": "Complete guide to maintaining your Aari embroidered garment.",
  "date": "January 2025",
  "readTime": "6 min read",
  "image": "/placeholder-2.svg",
  "content": "# How to Care for Your Hand-Embroidered Blouse\n\n## Washing Guidelines\n\n- **Hand wash only** - Never use a washing machine\n- **Cold water** - Use lukewarm or cold water\n- **Gentle detergent** - Use mild soap for delicate fabrics\n- **Minimal agitation** - Gently swirl, don't scrub\n\n## Drying & Storage\n\nAir dry away from direct sunlight. Store in a cool, dry place using acid-free tissue paper.\n\n## Dealing with Stains\n\nTreat stains immediately with gentle dabbing, never rubbing. For stubborn stains, consult a professional cleaner."
}
```

## Template 3: Tutorial/Educational

```json
{
  "id": 9,
  "slug": "understanding-aari-stitches",
  "title": "Understanding Different Types of Aari Stitches",
  "excerpt": "Explore various Aari stitching techniques and their applications.",
  "date": "January 2025",
  "readTime": "8 min read",
  "image": "/placeholder-1.svg",
  "content": "# The Art of Aari Stitches\n\n## Basic Stitches\n\n### Chain Stitch\n\nThe foundation of Aari embroidery, created using a hooked needle.\n\n### Seed Stitch\n\nSmall, discrete stitches used for filling and texture.\n\n### Satin Stitch\n\nSmooth, flat stitches that create a glossy surface.\n\n## Advanced Techniques\n\n### Beadwork Integration\n\nCombining threads with beads for added dimension.\n\n### Metallic Work\n\nUsing gold and silver threads for traditional bridal wear.\n\n## Choosing the Right Stitch\n\nEach stitch serves a purpose. Our experienced team knows exactly which technique to use."
}
```

## Important Notes When Adding Posts

1. **Unique ID**: Always use the next sequential number
2. **URL Slug**: Must be lowercase, use hyphens instead of spaces, no special characters
3. **Date Format**: Use "Month Year" format (e.g., "January 2025")
4. **Read Time**: Estimate reading time (e.g., "5 min read", "10 min read")
5. **Image**: Use `/placeholder-1.svg` or `/placeholder-2.svg` for placeholders
6. **Content**: Use `\n\n` for paragraph breaks, `\n` for line breaks
7. **Markdown**: Keep formatting simple:
   - `# ` for main heading
   - `## ` for subheading
   - `### ` for sub-subheading
   - `- ` for bullet points
   - `**text**` for bold
   - `*text*` for italic

## Example of Adding to blogs.json

Your `public/blogs.json` should look like:

```json
[
  {
    "id": 1,
    "slug": "existing-post",
    ...existing post data...
  },
  {
    "id": 2,
    "slug": "another-post",
    ...existing post data...
  },
  {
    "id": 3,
    "slug": "your-new-post",
    "title": "Your New Blog Post",
    ...new post data...
  }
]
```

Note the commas between objects!

## Quick Content Ideas for Aari Designs

- Care tips for embroidered garments
- Aari stitch techniques explained
- Design inspiration galleries
- Customer success stories
- Seasonal trends in embroidery
- Behind-the-scenes of the crafting process
- Q&A about custom designs
- Historical context of Aari embroidery
- Color coordination tips
- Wedding season preparation guides

---

Need more help? See `CONTENT_MANAGEMENT.md` for detailed instructions.

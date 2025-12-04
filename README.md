# Khadeeja Designs - Website

A modern, responsive Next.js website for Khadeeja Designs with an integrated blog system.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The website will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── pages/
│   ├── index.tsx              # Home page
│   ├── blog/
│   │   ├── index.tsx          # Blog listing page
│   │   └── [slug].tsx         # Individual blog post page
│   ├── api/
│   │   └── contact.ts         # Contact form API
│   ├── _app.tsx               # App wrapper
│   └── _document.tsx          # Document wrapper
├── components/
│   ├── Navigation.tsx         # Top navigation
│   ├── AnimatedBackground.tsx # Animated background
│   ├── WhatsAppButton.tsx     # WhatsApp CTA button
│   └── Seo.tsx                # SEO component
├── public/
│   ├── blogs.json             # Blog posts data
│   ├── images/                # Images folder
│   ├── logo.png               # Logo
│   └── shortLogo.png          # Short logo
├── styles/
│   └── globals.css            # Global styles
├── CONTENT_MANAGEMENT.md      # Content editing guide
└── README.md                  # This file
```

## 🎨 Design Features

- **Dark luxury theme** with gold accents
- **Fully responsive** for all device sizes
- **Smooth animations** and scroll reveals
- **Animated background** with gradients
- **WhatsApp integration** for easy contact
- **Mobile-optimized** navigation

## 📝 Managing Content

### Easy Content Updates

**For non-technical users**, see `CONTENT_MANAGEMENT.md` for:
- How to add/edit blog posts
- How to update home page content
- JSON format examples
- Markdown formatting guide

### Quick Steps

1. **Add Blog Post**: Edit `public/blogs.json` and add a new blog object
2. **Update Home Page**: Edit the sections in `pages/index.tsx`
3. **Change Contact Info**: Update contact details in `pages/index.tsx`

## 🔗 Key URLs

| Page | URL |
|------|-----|
| Home | `/` |
| Blog List | `/blog` |
| Blog Post | `/blog/[slug]` |
| Contact Form | `/#contact` |

## 📱 Responsive Design

The site is fully responsive and works perfectly on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 🖥️ Desktops (1024px+)
- 🖥️ Large screens (1920px+)

## ⚙️ Configuration

### WhatsApp Number
Edit in `components/WhatsAppButton.tsx` and `pages/index.tsx`:
```tsx
href="https://wa.me/919000000000"
```

### Contact Email
Edit in `pages/index.tsx`:
```tsx
<p className="text-neutral-300">khadeeja@designs.com</p>
```

## 🎯 Blog System

### How It Works

1. Blog posts are stored in `public/blogs.json`
2. Each post has metadata (title, date, excerpt, etc.)
3. Content is written in simple Markdown format
4. Posts are automatically rendered on `/blog/[slug]`

### Adding a Blog Post

```json
{
  "id": 7,
  "slug": "my-unique-post",
  "title": "My Blog Post Title",
  "excerpt": "Short 1-2 sentence description",
  "date": "January 2025",
  "readTime": "5 min read",
  "image": "/placeholder-1.svg",
  "content": "# Title\n\nYour content here..."
}
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.7 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.17
- **UI**: React 19.2.1
- **Images**: Next.js Image component
- **Icons**: Inline SVGs

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

The project can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- DigitalOcean
- Heroku
- etc.

## 🐛 Troubleshooting

### Blog posts not showing
- Check `public/blogs.json` JSON syntax is valid
- Ensure all required fields are present (id, slug, title, etc.)
- Clear browser cache (Ctrl+Shift+R)

### Styling issues
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`

### Images not loading
- Verify image paths start with `/`
- Check images are in `public` folder

## 📧 Support

For technical issues or questions, contact the developer.

## 📄 License

ISC

---

Made with ❤️ for Khadeeja Designs

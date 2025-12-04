import Navigation from "../../components/Navigation"
import AnimatedBackground from "../../components/AnimatedBackground"
import WhatsAppButton from "../../components/WhatsAppButton"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

interface Blog {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string
  content: string
}

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [allBlogs, setAllBlogs] = useState<Blog[]>([])

  useEffect(() => {
    if (!slug) return

    const fetchBlogs = async () => {
      try {
        const res = await fetch('/blogs.json')
        const data = await res.json()
        setAllBlogs(data)

        const found = data.find((b: Blog) => b.slug === slug)
        setBlog(found || null)
      } catch (error) {
        console.error('Error loading blog:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [slug])

  if (loading) {
    return (
      <>
        <AnimatedBackground />
        <Navigation />
        <main className="relative z-10 min-h-screen flex items-center justify-center">
          <p className="text-neutral-400">Loading...</p>
        </main>
      </>
    )
  }

  if (!blog) {
    return (
      <>
        <AnimatedBackground />
        <Navigation />
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <p className="text-neutral-400 mb-4">Blog post not found</p>
          <Link href="/blog">
            <button className="px-6 py-2 bg-amber-400 text-black font-semibold rounded hover:bg-amber-500">
              Back to Blog
            </button>
          </Link>
        </main>
      </>
    )
  }

  // Parse markdown content to HTML (simple markdown parser)
  const parseMarkdown = (markdown: string) => {
    let html = markdown
      .replace(/^### (.*?)$/gm, '<h3 class="text-2xl font-bold mt-8 mb-4 text-neutral-100">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-3xl font-bold mt-8 mb-4 text-neutral-100">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 class="text-4xl font-bold mb-6 text-amber-400">$1</h1>')
      .replace(/^\- (.*?)$/gm, '<li class="list-disc ml-6 text-neutral-300">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-neutral-300">')
      .replace(/^/gm, '')

    return `<div class="prose prose-invert"><p class="mb-4 text-neutral-300">${html}</p></div>`
  }

  return (
    <>
      <AnimatedBackground />
      <Navigation />
      <main className="relative z-10">
        {/* Header */}
        <section className="pt-32 pb-12 text-center px-6">
          <Link href="/blog" className="text-amber-400 hover:text-amber-300 mb-4 inline-block">
            ← Back to Blog
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-4">
            {blog.title}
          </h1>
          <p className="text-neutral-400 text-lg">
            {blog.date} • {blog.readTime}
          </p>
        </section>

        {/* Featured Image */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Content */}
        <section className="max-w-3xl mx-auto px-6 pb-24">
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: blog.content
                .split('\n\n')
                .map((paragraph: string) => {
                  if (paragraph.startsWith('# ')) {
                    return `<h1 class="text-4xl font-bold my-6 text-amber-400">${paragraph.replace('# ', '')}</h1>`
                  }
                  if (paragraph.startsWith('## ')) {
                    return `<h2 class="text-3xl font-bold my-6 text-neutral-100">${paragraph.replace('## ', '')}</h2>`
                  }
                  if (paragraph.startsWith('### ')) {
                    return `<h3 class="text-2xl font-bold my-4 text-neutral-100">${paragraph.replace('### ', '')}</h3>`
                  }
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph
                      .split('\n')
                      .filter((line: string) => line.startsWith('- '))
                      .map((line: string) => `<li class="ml-6 text-neutral-300">${line.replace('- ', '')}</li>`)
                      .join('')
                    return `<ul class="list-disc my-4">${items}</ul>`
                  }
                  return `<p class="mb-4 text-neutral-300 leading-relaxed">${paragraph}</p>`
                })
                .join('')
            }}
          />
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-900/70 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">Want a Custom Bridal Design?</h2>
            <p className="text-neutral-300 mt-2 mb-6">Share your inspiration we'll make a masterpiece.</p>
            <Link href="/#contact">
              <button className="px-8 py-3 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-500 transition">
                Contact Now
              </button>
            </Link>
          </div>
        </section>

        {/* Related Posts */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-neutral-100 mb-12">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allBlogs
              .filter((b) => b.slug !== slug)
              .slice(0, 3)
              .map((relatedBlog) => (
                <Link key={relatedBlog.id} href={`/blog/${relatedBlog.slug}`}>
                  <div className="bg-neutral-900 rounded-lg shadow-lg overflow-hidden transition-all hover:scale-105 cursor-pointer">
                    <div className="relative h-48 w-full">
                      <Image
                        src={relatedBlog.image}
                        alt={relatedBlog.title}
                        fill
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-amber-400 text-sm font-semibold mb-2">
                        {relatedBlog.date} • {relatedBlog.readTime}
                      </p>
                      <h3 className="text-lg font-bold text-white mb-2">{relatedBlog.title}</h3>
                      <p className="text-neutral-300 line-clamp-2 text-sm">{relatedBlog.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      <WhatsAppButton />
    </>
  )
}

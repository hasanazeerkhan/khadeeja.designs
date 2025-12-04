import Navigation from "../../components/Navigation"
import AnimatedBackground from "../../components/AnimatedBackground"
import WhatsAppButton from "../../components/WhatsAppButton"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Blog {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string
}

export default function Blog() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/blogs.json')
        const data = await res.json()
        setBlogs(data)
      } catch (error) {
        console.error('Error loading blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  useEffect(() => {
    // Scroll reveal observer
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })
    els.forEach(el => io.observe(el))

    return () => io.disconnect()
  }, [blogs])

  return (
    <>
      <AnimatedBackground />
      <Navigation />
      <main className="relative z-10">
        {/* Header */}
        <section className="pt-40 pb-12 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-400 mb-4">
            Our Blog
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Insights, trends, and stories about Aari embroidery, design inspiration, and our craft
          </p>
        </section>

        {/* Blog Grid */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          {loading ? (
            <p className="text-center text-neutral-400">Loading blogs...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <div className="bg-neutral-900 rounded-lg shadow-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl cursor-pointer data-reveal">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-amber-400 text-sm font-semibold mb-2">{blog.date} • {blog.readTime}</p>
                      <h3 className="text-xl font-bold text-white mb-3">{blog.title}</h3>
                      <p className="text-neutral-300 line-clamp-2">{blog.excerpt}</p>
                      <div className="mt-4 text-amber-400 font-semibold text-sm">
                        Read More →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-900/70 py-16 my-24">
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
      </main>

      <WhatsAppButton />

      <style jsx>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}

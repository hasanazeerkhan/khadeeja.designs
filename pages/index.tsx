import Seo from "../components/Seo"
import Navigation from "../components/Navigation"
import AnimatedBackground from "../components/AnimatedBackground"
import WhatsAppButton from "../components/WhatsAppButton"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function Home() {
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle')

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
  }, [])

  return (
    <>
      <Seo />
      <AnimatedBackground />
      <Navigation />
      <main className="relative z-10">
        {/* Landing Section */}
        <section className="h-screen w-full flex flex-col items-center justify-center text-center relative">
          <div className="flex flex-col items-center gap-8">
            <img src="/logo.png" alt="Khadeeja Designs Logo" className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl" />
            <h1 className="text-5xl md:text-7xl font-serif text-amber-400 tracking-widest">
              Khadeeja Designs
            </h1>
          </div>
          <div className="absolute bottom-12 flex flex-col items-center gap-2 text-amber-400 animate-bounce">
            <span className="text-sm">Scroll Down</span>
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="min-h-screen py-24 px-8">
          <div className="max-w-4xl mx-auto">
            {/* Question 1 */}
            <div className="min-h-[80vh] flex items-center justify-center border-b border-neutral-700 py-24" data-reveal>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400 mb-4">
                  Who are we and what do we create?
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-6">
                  We are Khadeeja Designs creators of handcrafted Aari embroidery.
                </h2>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed">
                  Every thread, every bead, every detail is crafted with patience, precision, and passion. We turn fabrics into art.
                </p>
              </div>
            </div>

            {/* Question 2 */}
            <div className="min-h-[80vh] flex items-center justify-center border-b border-neutral-700 py-24" data-reveal>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400 mb-4">
                  What makes our Aari work special?
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-6">
                  We don't just embellish clothes we bring emotions to life.
                </h2>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed">
                  Each piece is 100% hand-crafted, ensuring uniqueness, depth, and a richness no machine can ever recreate.
                </p>
              </div>
            </div>

            {/* Question 3 */}
            <div className="min-h-[80vh] flex items-center justify-center border-b border-neutral-700 py-24" data-reveal>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400 mb-4">
                  Do we customize designs?
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-6">
                  Absolutely.
                </h2>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed">
                  Whether it's a sketch you saw on Pinterest or a design you dreamt of at 2 AM — we bring your idea to reality, stitch by stitch.
                </p>
              </div>
            </div>

            {/* Question 4 */}
            <div className="min-h-[80vh] flex items-center justify-center border-b border-neutral-700 py-24" data-reveal>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400 mb-4">
                  Can you trust us with your bridal outfit?
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-6">
                  With closed eyes.
                </h2>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed">
                  We understand the responsibility, the emotion, and the pressure. Your bridal blouse won't just be perfect it'll be unforgettable.
                </p>
              </div>
            </div>

            {/* Question 5 */}
            <div className="min-h-[80vh] flex items-center justify-center border-b border-neutral-700 py-24" data-reveal>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400 mb-4">
                  How long does a typical project take?
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-6">
                  Depending on the complexity, anywhere between 7–21 days.
                </h2>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed">
                  We don't rush art we perfect it.
                </p>
              </div>
            </div>

            {/* Question 6 */}
            <div className="min-h-[80vh] flex items-center justify-center py-24" data-reveal>
              <div className="text-center">
                <p className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400 mb-4">
                  What's the price range of our Aari work?
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-6">
                  Simple designs start from ₹1500, and bridal/advanced work starts from ₹5000.
                </h2>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed">
                  You're not paying for thread you're paying for craftsmanship.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="min-h-screen py-24 px-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400 mb-4">Our Work</p>
            <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 mb-12">Portfolio Highlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                'demo1.webp', 'demo2.webp', 'demo3.webp', 'demo4.jpg', 'demo5.webp', 'demo6.webp',
                'demo7.jpg', 'demo8.jpg', 'demo9.jpg', 'demo10.jpg', 'demo11.jpg', 'demo12.jpg',
                'demo13.jpg', 'demo14.jpg', 'demo15.jpg', 'demo16.jpg', 'demo17.jpg', 'demo18.jpg'
              ].map((image, index) => (
                <div key={index} className="relative group overflow-hidden rounded-xl shadow-lg aspect-square cursor-pointer data-reveal">
                  <Image
                    src={`/portfolio/${image}`}
                    alt={`Portfolio item ${index + 1}`}
                    fill
                    className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
            <div className="mt-14">
              <a
                href="#contact"
                className="px-8 py-4 rounded-full bg-amber-400 text-black font-bold text-lg hover:scale-105 transition-transform inline-block"
              >
                Book a Custom Design
              </a>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen py-24 px-8 flex items-center justify-center">
          <div className="max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-10">
            <div className="bg-neutral-900 p-8 rounded-lg shadow-lg data-reveal">
              <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
              <p className="text-lg text-neutral-300 mb-6">
                Have a design in mind? Let's make it happen.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-amber-400 font-semibold">Email</p>
                  <p className="text-neutral-300">khadeeja@designs.com</p>
                </div>
                <div>
                  <p className="text-amber-400 font-semibold">WhatsApp</p>
                  <p className="text-neutral-300">+91 9000 000 000</p>
                </div>
                <div>
                  <p className="text-amber-400 font-semibold">Location</p>
                  <p className="text-neutral-300">Hyderabad, India</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 p-8 rounded-lg shadow-lg data-reveal">
              <h2 className="text-3xl font-bold text-white mb-6">Send an Enquiry</h2>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                setStatus('sending')
                const formData = new FormData(e.currentTarget)
                
                try {
                  const res = await fetch('/api/contact', {
                    method: 'POST',
                    body: formData,
                  })
                  setStatus(res.ok ? 'ok' : 'error')
                  if (res.ok) e.currentTarget.reset()
                } catch {
                  setStatus('error')
                }
              }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 focus:border-amber-400 outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 focus:border-amber-400 outline-none"
                />
                <textarea
                  name="message"
                  placeholder="Tell us about your design idea..."
                  rows={4}
                  required
                  className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 focus:border-amber-400 outline-none"
                />
                <input name="_gotcha" style={{ display: 'none' }} />
                <button
                  type="submit"
                  className="w-full px-8 py-3 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-500 transition disabled:opacity-50"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Enquiry'}
                </button>
                {status === 'ok' && <p className="text-green-400">Message sent successfully!</p>}
                {status === 'error' && <p className="text-red-400">Something went wrong. Please try again.</p>}
              </form>
            </div>
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

import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: radial-gradient(1200px 600px at 50% 110%, rgba(245, 158, 11, 0.12), transparent 60%),
            radial-gradient(1000px 500px at 10% -10%, rgba(245, 158, 11, 0.08), transparent 60%),
            linear-gradient(180deg, #000, #0a0a0a 60%, #000);
          color: #f3f4f6;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          min-height: 100vh;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}

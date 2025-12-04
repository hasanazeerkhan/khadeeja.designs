import Head from 'next/head'

type Props = {
  title?: string
  description?: string
  image?: string
  url?: string
}

export default function Seo({ title, description, image, url }: Props) {
  const siteTitle = title ? `${title} — Khadeeja Designs` : 'Khadeeja Designs — Handcrafted Aari Embroidery'
  const desc = description || 'Bespoke, handcrafted aari embroidery for bridal and couture.'
  const img = image || '/images/og-image.webp'
  const siteUrl = url || 'https://your-domain.example/'

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={desc} />

      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={siteUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={siteUrl} />
    </Head>
  )
}

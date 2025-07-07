import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogType?: 'website' | 'article' | 'product' | 'profile'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  structuredData?: Record<string, any>
  canonical?: string
  alternateLanguages?: Record<string, string>
  articleAuthor?: string
  articlePublisher?: string
  articleSection?: string
  articleTags?: string[]
  articlePublishedTime?: string
  articleModifiedTime?: string
  productPrice?: string
  productCurrency?: string
  productAvailability?: string
  productBrand?: string
  productCategory?: string
  noindex?: boolean
  nofollow?: boolean
}

const DEFAULT_SEO = {
  title: 'PROMPTHERO - Transform Messy Thoughts into Perfect AI Prompts',
  description: 'AI-powered prompt engineering tool that transforms your rough ideas into high-quality, ready-to-use prompts. Improve AI output quality by 3-5x with our Quick, Deep, Few-Shot, Chain-of-Thought, and Video modes.',
  keywords: [
    'prompt engineering',
    'AI prompts',
    'ChatGPT prompts',
    'AI tools',
    'prompt optimization',
    'artificial intelligence',
    'machine learning',
    'prompt generator',
    'video prompts',
    'AI video generation',
    'prompt marketplace',
    'AI content creation',
    'prompt templates',
    'AI assistant',
    'LLM prompts'
  ],
  ogImage: '/og-image.png',
  ogUrl: 'https://prompthero.app',
  twitterCard: 'summary_large_image' as const,
  ogType: 'website' as const
}

export default function SEOHead({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_SEO.ogImage,
  ogUrl = DEFAULT_SEO.ogUrl,
  ogType = DEFAULT_SEO.ogType,
  twitterCard = DEFAULT_SEO.twitterCard,
  structuredData,
  canonical,
  alternateLanguages,
  articleAuthor,
  articlePublisher,
  articleSection,
  articleTags,
  articlePublishedTime,
  articleModifiedTime,
  productPrice,
  productCurrency,
  productAvailability,
  productBrand,
  productCategory,
  noindex = false,
  nofollow = false
}: SEOProps) {
  const finalTitle = title
  const finalDescription = description
  const finalOgTitle = ogTitle || title
  const finalOgDescription = ogDescription || description
  const robotsContent = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`

  // Generate default structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PROMPTHERO',
    description: finalDescription,
    url: ogUrl,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    creator: {
      '@type': 'Organization',
      name: 'PROMPTHERO Team'
    },
    features: [
      'AI Prompt Engineering',
      'Video Prompt Generation',
      'Prompt Templates',
      'Marketplace',
      'Analytics Dashboard',
      'Prompt History'
    ]
  }

  // Merge custom structured data with default
  const finalStructuredData = structuredData || defaultStructuredData

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="PROMPTHERO Team" />
      <meta name="creator" content="PROMPTHERO" />
      <meta name="publisher" content="PROMPTHERO" />
      <meta name="robots" content={robotsContent} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3b82f6" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Alternate Languages */}
      {alternateLanguages && Object.entries(alternateLanguages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={finalOgTitle} />
      <meta property="og:site_name" content="PROMPTHERO" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article-specific Open Graph Tags */}
      {ogType === 'article' && (
        <>
          {articleAuthor && <meta property="article:author" content={articleAuthor} />}
          {articlePublisher && <meta property="article:publisher" content={articlePublisher} />}
          {articleSection && <meta property="article:section" content={articleSection} />}
          {articleTags && articleTags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
          {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
          {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
        </>
      )}
      
      {/* Product-specific Open Graph Tags */}
      {ogType === 'product' && (
        <>
          {productPrice && <meta property="product:price:amount" content={productPrice} />}
          {productCurrency && <meta property="product:price:currency" content={productCurrency} />}
          {productAvailability && <meta property="product:availability" content={productAvailability} />}
          {productBrand && <meta property="product:brand" content={productBrand} />}
          {productCategory && <meta property="product:category" content={productCategory} />}
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@prompthero" />
      <meta name="twitter:creator" content="@prompthero" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={finalOgTitle} />
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="email=no" />
      <meta name="format-detection" content="address=no" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData)
        }}
      />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://api.prompthero.app" />
      
      {/* DNS prefetch for performance */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://api.prompthero.app" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* Performance Hints */}
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
    </Head>
  )
} 
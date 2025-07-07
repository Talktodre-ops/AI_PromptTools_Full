import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PROMPTHERO - Transform Messy Thoughts into Perfect AI Prompts",
  description:
    "AI-powered prompt engineering tool that transforms your rough ideas into high-quality, ready-to-use prompts. Improve AI output quality by 3-5x with our Quick, Deep, Few-Shot, Chain-of-Thought, and Video modes.",
  keywords: [
    "prompt engineering",
    "AI prompts",
    "ChatGPT prompts",
    "AI tools",
    "prompt optimization",
    "artificial intelligence",
    "machine learning",
    "prompt generator",
    "video prompts",
    "AI video generation",
  ],
  authors: [{ name: "PROMPTHERO Team" }],
  creator: "PROMPTHERO",
  publisher: "PROMPTHERO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://prompthero.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PROMPTHERO - Transform Messy Thoughts into Perfect AI Prompts",
    description:
      "AI-powered prompt engineering tool that transforms your rough ideas into high-quality, ready-to-use prompts. Improve AI output quality by 3-5x.",
    url: "https://prompthero.app",
    siteName: "PROMPTHERO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PROMPTHERO - AI Prompt Engineering Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PROMPTHERO - Transform Messy Thoughts into Perfect AI Prompts",
    description:
      "AI-powered prompt engineering tool that transforms your rough ideas into high-quality, ready-to-use prompts.",
    images: ["/og-image.png"],
    creator: "@prompthero",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "PROMPTHERO",
              description:
                "AI-powered prompt engineering tool that transforms your rough ideas into high-quality, ready-to-use prompts.",
              url: "https://prompthero.app",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: "PROMPTHERO Team",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

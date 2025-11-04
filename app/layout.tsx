import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { RootAuthProvider } from "./auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: {
    default: "Pura Admin Dashboard",
    template: "%s | Pura Admin",
  },

  description: "Admin dashboard for Pura Agung Kertajaya",

  keywords: [
    "Pura Agung Kertajaya",
    "Dashboard Pura",
    "Manajemen Konten Pura",
    "CMS Pura",
  ],

  authors: [{ name: "Pura Agung Kertajaya" }],
  creator: "Pura Agung Kertajaya",
  publisher: "Pura Agung Kertajaya",

  metadataBase: new URL("https://puraagungkertajaya.com"),

  openGraph: {
    title: "Pura Admin Dashboard",
    description: "Admin dashboard for Pura Agung Kertajaya",
    url: "https://puraagungkertajaya.com/admin",
    siteName: "Pura Agung Kertajaya",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pura Admin Dashboard",
    description: "Admin dashboard for Pura Agung Kertajaya",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <RootAuthProvider>{children}</RootAuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}


import type { Metadata } from "next"
import { IBM_Plex_Sans_Arabic, Inter, Sora } from "next/font/google"

import ThemeProvider from "@/components/providers/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"

import "@/styles/globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "MARSA",
  description: "A structured workspace for entrepreneurs — from idea to execution",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteRes = await fetch(`${process.env.BACKEND_URL ?? 'http://localhost:8000'}/api/site`, {
    next: { revalidate: 60 },
  }).catch(() => null)
  const siteSettings = siteRes?.ok
    ? (await siteRes.json() as { settings: { primary_color: string; secondary_color: string } }).settings
    : null
  const primary = siteSettings?.primary_color ?? '#002d62'
  const secondary = siteSettings?.secondary_color ?? '#00c4cc'

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${ibmPlexArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: extensions often inject attrs on <body> (e.g. cz-shortcut-listen) */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <style>{`:root { --marsa-anchor-blue: ${primary}; --marsa-action-teal: ${secondary}; }`}</style>
        <ThemeProvider
          attribute="class"
          defaultTheme="midnight"
          themes={["light", "midnight"]}
          value={{ light: "light", midnight: "dark" }}
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

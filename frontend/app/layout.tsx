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
    icon: [{ url: "/icon.png" }],
    apple: [{ url: "/icon.png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} ${ibmPlexArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
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

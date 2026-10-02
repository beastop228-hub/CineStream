import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import { ClientTVDetector } from "@/components/ClientTVDetector";

// Wrap non-essential dynamic widgets in next/dynamic to prevent hydration blocking on legacy TVs
const MediaDetailsModal = dynamic(
  () => import("@/components/media/MediaDetailsModal").then((mod) => mod.MediaDetailsModal)
);

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CineStream — Stream Without Limits",
    template: "%s | CineStream",
  },
  description:
    "Watch award-winning series, blockbuster films, and exclusive indie cinema in 4K HDR. Unlimited stories, zero interruption.",
  openGraph: {
    siteName: "CineStream",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Critical inline CSS: guarantees a dark background and readable text
            even when the TV's legacy browser engine fails to parse Tailwind v4.
            Without this, Smart TVs render raw white HTML (as seen in the TV screenshots). */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background-color: #000 !important;
                color: #fff !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              /* Extreme fallback resets if Tailwind fails */
              a { color: inherit !important; text-decoration: none !important; }
              ul, ol { list-style: none !important; padding: 0 !important; margin: 0 !important; }
              img { max-width: 100%; height: auto; }
              /* TV overscan safe zone */
              @media (min-width: 1920px) {
                body { padding: 3vh 5vw; }
              }
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-text-primary">
        <ClientTVDetector />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MediaDetailsModal />
      </body>
    </html>
  );
}
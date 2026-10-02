import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MediaDetailsModal } from "@/components/media/MediaDetailsModal";

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
      <body className="flex min-h-full flex-col bg-background text-text-primary">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MediaDetailsModal />
      </body>
    </html>
  );
}
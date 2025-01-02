import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sejmofil",
  description: "Bo posłów trzeba pilnować!",
  keywords: [
    "Sejm",
    "Parlament",
    "sejm-stats",
    "sejmofil",
    "Polska",
    "AI",
    "Analiza danych",
    "Polityka",
    "Prawo",
    "Ustawy",
    "Akty prawne",
    "Polski parlament",
    "Sztuczna inteligencja",
    "Analiza prawa",
    "Legislacja",
    "Interpelacje poselskie",
    "Głosowania sejmowe",
    "Komisje parlamentarne",
  ],
  authors: [
    {
      name: "Michał Skibiński",
      url: "https://github.com/miskibin",
    },
  ],
  creator: "Michał Skibiński",
  publisher: "sejmofil.pl",
  applicationName: "Sejmofil",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "legal",
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
  alternates: {
    canonical: "https://sejmofil.pl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <script
          async
          src="https://umami.msulawiak.pl/script.js"
          data-website-id="5b5c27b4-9296-472d-9f68-b205f7706e0b"
        />
      </head>
      <body className={`${inter.variable} antialiased bg-neutral-50`}>
        <Navbar />
        <main className="container mx-auto max-w-7xl mt-4 2xl:max-w-[1400px] p-4 sm:p-6 lg:p-12  ">
          <div className="min-h-screen mt-8">{children}</div>
        </main>
        <hr className="my-8 mx-4" />

        <Footer />
      </body>
    </html>
  );
}

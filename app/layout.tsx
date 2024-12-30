import type { Metadata } from "next";
import {  Inter } from "next/font/google";
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
      <body
        className={`${inter.variable} antialiased bg-neutral-50`}
      >
        <Navbar />
    <main className="container mx-auto max-w-7xl 2xl:max-w-[1400px] p-4 sm:p-6 lg:p-12  ">

        <div className="min-h-screen mt-8">{children}</div>
        </main>
        <hr className="my-8 mx-4" />

        <Footer />

      </body>
    </html>
  );
}

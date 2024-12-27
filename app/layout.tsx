import type { Metadata } from "next";
import {  Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";


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
        className={`${inter.variable} antialiased`}
      >
        <Navbar />
        <div className="min-h-screen mt-8 bg-gray-50">{children}</div>
      </body>
    </html>
  );
}

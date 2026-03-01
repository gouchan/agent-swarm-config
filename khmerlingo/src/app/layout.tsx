import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KhmerLingo — Learn Khmer",
  description:
    "The first Duolingo-style app for learning the Khmer (Cambodian) language. Free, gamified beginner lessons.",
  keywords: ["Khmer", "Cambodian", "language learning", "Duolingo", "ភាសាខ្មែរ"],
  openGraph: {
    title: "KhmerLingo",
    description: "Learn Khmer for free — gamified lessons for beginners",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {children}
      </body>
    </html>
  );
}

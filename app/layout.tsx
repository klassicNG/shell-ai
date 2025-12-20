import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shell-AI | Linux Command Translator",
  description: "Translate natural language to Linux commands instantly.",
  openGraph: {
    title: "Shell-AI",
    description: "Don't memorize commands. Generate them.",
    url: "https://shell-ai-two.vercel.app",
    siteName: "Shell-AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shell-AI",
    description: "Don't memorize commands. Generate them.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

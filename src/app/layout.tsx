import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SWE Arena - AI Coding Agent Leaderboard",
  description: "Track and compare AI coding agents contributing to open source on GitHub. See which AI tools are creating the most PRs, getting merged, and reviewing code.",
  keywords: ["AI", "coding", "GitHub", "Copilot", "Cursor", "Devin", "Claude", "leaderboard", "pull requests", "code review"],
  authors: [{ name: "SWE Arena" }],
  openGraph: {
    title: "SWE Arena - AI Coding Agent Leaderboard",
    description: "Track and compare AI coding agents contributing to open source on GitHub.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SWE Arena - AI Coding Agent Leaderboard",
    description: "Track and compare AI coding agents contributing to open source on GitHub.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

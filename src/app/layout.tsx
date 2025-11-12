import "./globals.css"; // Global CSS import
import "@/lib/orpc/client.server"; // Initialize server-side oRPC client for pre-rendering

import type { Metadata } from "next";
import { Comfortaa, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Providers from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";

const comfortaa = Comfortaa({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Greendex - Carbon Footprint Calculator for Erasmus+ Projects",
  description:
    "Specialized carbon footprint calculator for Erasmus+ youth exchanges, training courses, and meetings. Calculate CO2 emissions and discover how many trees are needed to offset your project's environmental impact.",
  keywords: [
    "carbon footprint",
    "Erasmus+",
    "youth exchange",
    "sustainability",
    "CO2 calculator",
    "environmental impact",
    "tree planting",
  ],
  authors: [{ name: "Greendex" }],
  openGraph: {
    title: "Greendex - Carbon Footprint Calculator for Erasmus+ Projects",
    description:
      "Calculate and offset the carbon footprint of your Erasmus+ projects with our specialized CO2 calculator.",
    url: "https://greendex.world/",
    siteName: "Greendex",
    type: "website",
    images: ["/greendex_logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Greendex - Carbon Footprint Calculator for Erasmus+ Projects",
    description:
      "Calculate and offset the carbon footprint of your Erasmus+ projects with our specialized CO2 calculator.",
    images: ["/greendex_logo.png"],
  },
  icons: {
    icon: "/greendex_logo_small.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body
        className={`${comfortaa.className} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <Providers>{children}</Providers>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}

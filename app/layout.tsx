import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteStateProvider } from "./components/SiteState";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteOrigin = process.env.SITE_URL ?? "http://localhost:3000";
const title = "NAROK DESIGN — Ethiopian Heritage, Made for the World";
const description = "Traditional Ethiopian clothing for women, men and children, designed in Addis Ababa and available ready-made or made to order.";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  openGraph: { title, description, type: "website", images: [{ url: "/og-narok.png", width: 1536, height: 1024, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-narok.png"] },
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
        <SiteStateProvider>{children}</SiteStateProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReviewGuard — AI Review Management for Local Businesses",
  description:
    "ReviewGuard monitors your Google, Yelp, and Facebook reviews 24/7 and drafts perfect responses in seconds. You just approve.",
  openGraph: {
    title: "ReviewGuard — AI Review Management",
    description:
      "Never miss a customer review again. AI monitors and drafts responses so you can focus on your business.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}

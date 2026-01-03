import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rasid - Modern Invoice Generation Platform",
  description: "Professional invoice generation platform for modern businesses. Create, digitize, and verify invoices with ease.",
  keywords: ["invoice", "billing", "receipt", "OCR", "digital invoice", "rashid"],
  authors: [{ name: "Rasid" }],
  openGraph: {
    title: "Rasid - Modern Invoice Generation",
    description: "Professional invoice generation platform for modern businesses",
    type: "website",
    images: [
      {
        url: "/images/rasid_thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Rasid - Modern Invoice Generation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rasid - Modern Invoice Generation",
    description: "Professional invoice generation platform for modern businesses",
    images: ["/images/rasid_thumbnail.png"],
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rasid.in"),
  title: {
    default: "Rasid — AI-Powered Smart Invoice Platform",
    template: "%s | Rasid",
  },
  description: "Create tamper-proof invoices with AI-powered OCR, cryptographic QR verification, automated payment reminders, and multi-channel delivery. Free plan available.",
  keywords: ["invoice", "billing", "receipt", "OCR", "digital invoice", "invoice verification", "QR code invoice", "GST invoice", "payment reminder", "rasid"],
  authors: [{ name: "Rasid" }],
  creator: "Rasid",
  openGraph: {
    title: "Rasid — AI-Powered Smart Invoice Platform",
    description: "Create tamper-proof invoices with AI-powered OCR, cryptographic QR verification, and automated payment reminders.",
    type: "website",
    siteName: "Rasid",
    locale: "en_US",
    images: [
      {
        url: "/api/og?page=home",
        width: 1200,
        height: 630,
        alt: "Rasid — AI-Powered Smart Invoice Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rasid — AI-Powered Smart Invoice Platform",
    description: "Create tamper-proof invoices with AI-powered OCR, cryptographic QR verification, and automated payment reminders.",
    images: ["/api/og?page=home"],
  },
  icons: {
    icon: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
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

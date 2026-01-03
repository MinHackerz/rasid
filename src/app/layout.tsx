import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rasid - Modern Invoice Generation",
  description: "Professional invoice generation platform for modern businesses. Create, digitize, and verify invoices with ease.",
  keywords: ["invoice", "billing", "receipt", "OCR", "digital invoice", "rashid"],
  authors: [{ name: "Rasid" }],
  openGraph: {
    title: "Rasid - Modern Invoice Generation",
    description: "Professional invoice generation platform for modern businesses",
    type: "website",
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

---
description: Deployment and local setup guide for Rashid Invoice Platform
---

# Rashid Setup Guide

This guide will help you set up and run the Rashid Invoice Platform locally or in production.

## Prerequisites

- Node.js 18+ (20+ recommended)
- PostgreSQL database
- Hugging Face API Key (for OCR features)
- SMTP server (for email delivery)

## Local Installation

1. **Clone the repository** (if not already in the directory)
2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your database URL, JWT secret, Hugging Face API key, and SMTP credentials.

4. **Initialize Database**:
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**:
```bash
npm run dev
```

6. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Usage

### 1. Register & Login
Create a seller account to access the dashboard.

### 2. Legacy Conversion (OCR)
- Navigate to **Upload & Convert**
- Drag and drop images or PDFs of handwritten invoices
- Wait for AI to extract data
- Review and click **Create Invoice** to finalize

### 3. Digital Invoices
- Use **New Invoice** for manual entry
- All invoices get a unique QR code and verification link
- Download as PDF or send via Email/WhatsApp

### 4. Verification
- Anyone can scan the QR code on the PDF
- The link directs them to the public verification page
- System checks the cryptographic signature to ensure authenticity

## Production Deployment

### Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Add all environment variables from `.env.example` to Vercel dashboard.
4. Deployment should be automatic.

### Self-Hosting (Docker)
Ensure you have Puppeteer dependencies installed in your environment if self-hosting outside of Vercel.

## Design Aesthetic
The app uses **Tailwind 4** and a custom design system focused on **minimalism**, **premium typography (Inter)**, and **smooth transitions**.

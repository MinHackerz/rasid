# Rasid - Invoice Generation Platform

A modern invoice management platform with AI-powered OCR, cryptographic verification, and seamless delivery.

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- PostgreSQL database
- Environment variables configured (see below)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rasid"

# Clerk Authentication (get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Verification Secret (generate using methods below)
VERIFICATION_SECRET="your-secret-here"

# Legacy Verification Secret (optional - for verifying old invoices)
# Set this if you changed VERIFICATION_SECRET and have existing invoices
# Use the OLD secret that was used to create those invoices
VERIFICATION_SECRET_LEGACY="old-secret-here"

# OCR (optional - for digitization features)
HUGGINGFACE_API_KEY="hf_..."
OPENAI_API_KEY="sk-..."

# Email/WhatsApp (optional - for sending invoices)
# See Settings page for configuration

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Generating VERIFICATION_SECRET

The `VERIFICATION_SECRET` is used for cryptographic signing of invoices. Generate a secure random string using one of these methods:

**Method 1: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Method 2: Using OpenSSL**
```bash
openssl rand -hex 64
```

**Method 3: Using Online Generator**
- Visit: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Keys" (256-bit) or longer
- Copy the generated key

**Important:**
- Use a long, random string (at least 64 characters)
- Keep it secret and never commit it to version control
- Use different secrets for development and production
- Store it securely in your environment variables

**Legacy Secret (for existing invoices):**
If you have existing invoices that were created with a different secret, set `VERIFICATION_SECRET_LEGACY` to the old secret. This allows verification of invoices created before you changed the secret.

Example:
```env
VERIFICATION_SECRET="new-secret-for-new-invoices"
VERIFICATION_SECRET_LEGACY="old-secret-for-existing-invoices"
```

3. **Initialize Database:**
```bash
npx prisma generate
npx prisma db push
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Access the app:**
Open [http://localhost:3000](http://localhost:3000) in your browser.


## Production Deployment

### Environment Variables for Production

**CRITICAL:** Use different secrets for production than development!

1. **Generate a production verification secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Set all environment variables in your hosting platform:**

#### Vercel Deployment

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all variables from `.env.example`:
   - `DATABASE_URL` (production database)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production key)
   - `CLERK_SECRET_KEY` (production key)
   - `VERIFICATION_SECRET` (generate new one for production!)
   - `NEXT_PUBLIC_APP_URL` (your production domain)
   - Optional: OCR keys, etc.

4. **Important:** Set `VERIFICATION_SECRET` to a different value than development
5. Redeploy your application

#### Other Platforms (Railway, Render, etc.)

1. Add environment variables in your platform's dashboard
2. Use the same variables as listed above
3. Ensure `VERIFICATION_SECRET` is set and different from development
4. Restart/redeploy your application

### Security Checklist

- [ ] `VERIFICATION_SECRET` is set and different from development
- [ ] `VERIFICATION_SECRET` is at least 64 characters long
- [ ] All secrets are stored in environment variables (never in code)
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] Production database URL is configured
- [ ] Production Clerk keys are configured
- [ ] `NEXT_PUBLIC_APP_URL` points to your production domain

### Verification Secret Best Practices

1. **Development:**
   - Can use the default (with warning) or generate one
   - Store in `.env` file (not committed)

2. **Production:**
   - **MUST** be set (app will fail to start if missing)
   - Should be at least 64 characters
   - Should be different from development secret
   - Store securely in hosting platform's environment variables
   - Never commit to version control

3. **If you need to rotate the secret:**
   - Generate a new secret
   - Update environment variable
   - **Note:** Existing invoices will need to be re-signed (or they won't verify)
   - Consider a migration strategy if you have many invoices

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

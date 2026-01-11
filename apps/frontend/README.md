# Zennote Frontend

Next.js 15 frontend for Zennote, built with the App Router and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Auth**: Clerk (authentication)
- **UI Components**: shadcn/ui
- **Code Highlighting**: Shiki
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+
- Clerk account and API keys
- Backend API running (see `apps/backend/`)

### Environment Variables

Create `.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8787

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# OG Images
NEXT_PUBLIC_OG_CDN_BASE_URL=https://pub-XXXXX.r2.dev

# Base URL (for production)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Auth pages (login, register)
│   ├── [username]/   # User profile pages
│   ├── notes/        # Notes listing and management
│   └── s/            # Short note URLs
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   ├── notes/        # Note-related components
│   └── profile/      # Profile components
├── lib/              # Utilities and helpers
│   ├── api/          # API client functions
│   ├── metadata/     # SEO metadata generation
│   └── providers/    # React context providers
└── types/            # TypeScript type definitions
```

## Features

- **Markdown Editor**: Rich markdown editing with live preview
- **Public/Private Notes**: Share notes publicly or keep them private
- **User Profiles**: Customizable profiles with usernames and slugs
- **OG Images**: Pre-generated Open Graph images for social sharing
- **Responsive Design**: Mobile-first responsive UI
- **Dark Mode**: System-aware theme switching

## Deployment

Deploy to Cloudflare Pages:

```bash
npm run build
# Deploy via Cloudflare Pages dashboard or Wrangler
```

See the root [README.md](../../README.md) for full deployment instructions.

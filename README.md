# SatSip ⚡

**SatSip** is a modern Bitcoin Lightning payment profile platform that allows creators to easily receive tips and payments from their audience. Think of it as a "Lightning Linktree" where creators can showcase their content, social links, and receive Bitcoin payments all in one place.

## ✨ Features

- **Creator Profiles**: Beautiful, customizable profile pages with multiple themes
- **Multi-Wallet Support**: Support for Lightning, Bitcoin, Ethereum, Solana, Dogecoin, and Monero addresses
- **Link Management**: Add and organize links to your content, social media, and projects
- **QR Code Generation**: Automatic QR code generation for easy mobile payments
- **Custom Themes**: Multiple theme options to match your brand

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vorsakha/satsip.git
cd satsip
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env
```

4. Configure your database and other environment variables in `.env`:
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

5. Run database migrations:
```bash
npm run db:generate
```

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app running!

## 🛠️ Tech Stack

This project is built with the [T3 Stack](https://create.t3.gg/):

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[NextAuth.js](https://next-auth.js.org)** - Authentication
- **[Prisma](https://prisma.io)** - Database ORM
- **[tRPC](https://trpc.io)** - Type-safe API layer
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[PostgreSQL](https://postgresql.org)** - Database
- **[TypeScript](https://typescriptlang.org)** - Type safety

### Additional Features

- **QR Code Generation** with `qrcode.react`
- **Form Handling** with `react-hook-form` and `zod`
- **UI Components** with `@radix-ui` primitives
- **Web Scraping** with `puppeteer` for link previews
- **File Uploads** with `uploadthing`

## 📱 How It Works

1. **Sign Up**: Users authenticate using Discord OAuth
2. **Create Profile**: Complete onboarding with username, bio, and wallet addresses
3. **Add Wallets**: Configure Lightning addresses and other crypto wallet addresses
4. **Add Links**: Create links to your content, social media, or other resources
5. **Customize**: Choose from available themes to match your brand

## 🎨 Profile Features

- **Custom Avatars**: Upload or link to profile images
- **Bio & Description**: Tell your audience about yourself
- **Lightning Tipping**: One-click Bitcoin Lightning payments
- **Link Gallery**: Showcase your content with rich link previews
- **Theme System**: Multiple pre-built themes with more coming soon

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio database GUI
- `npm run db:push` - Push schema changes to database
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

### Database

Use Prisma Studio to explore your database:
```bash
npm run db:studio
```

## 🚀 Deployment

SatSip can be deployed on various platforms:

- **[Vercel](https://vercel.com)** - Recommended for Next.js apps
- **[Railway](https://railway.app)** - Great for full-stack apps with databases
- **[Fly.io](https://fly.io)** - Docker-based deployment
- **[DigitalOcean App Platform](https://digitalocean.com/products/app-platform)**

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

## 🔗 Links

- [Lightning Network](https://lightning.network) - Learn about Bitcoin Lightning
- [Bitcoin](https://bitcoin.org) - Learn about Bitcoin

---

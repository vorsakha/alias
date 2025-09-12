# Nostr Links ⚡🔴

**Nostr Links** is a **fully decentralized** profile platform for **bitcoiners** powered by **Nostr**. No servers, no databases, no centralized control - your data lives on the Nostr network where you own it completely.

Think of it as a **decentralized Linktree** where bitcoiners can showcase their content, social links, and receive Lightning payments - all stored permanently on Nostr relays worldwide.

## ✨ Features

- 🚀 **Fully Decentralized**: No servers, no databases - data lives on Nostr
- 🔐 **Self-Sovereign**: You own your data, you control your identity
- ⚡ **Lightning Fast**: Real-time updates via Nostr subscriptions
- 🎨 **Beautiful Profiles**: 20+ customizable themes across 6 categories
- ⚡ **Lightning Zaps**: Instant Bitcoin payments via Lightning Network
- 🔗 **Link Management**: Drag-and-drop link organization with rich previews
- 🛡️ **Censorship Resistant**: Your content can't be taken down
- 🎭 **Theme Customization**: Minimal, Vibrant, Professional, Creative, Retro, and Futuristic themes
- 🔄 **Real-time Updates**: Live profile updates across all connected clients

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Nostr-compatible browser extension (like Alby, Nos2x, or Flamingo)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/nostr-links.git
cd nostr-links
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your decentralized app running!

## 🛠️ Tech Stack

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[Nostr](https://nostr.com)** - Decentralized social protocol
- **[Nostr Tools](https://github.com/nbd-wtf/nostr-tools)** - Nostr protocol utilities
- **[NDK](https://github.com/nostr-dev-kit/ndk)** - Nostr Development Kit
- **[Tailwind CSS](https://tailwindcss.com)** - Styling with custom theme system
- **[TypeScript](https://typescriptlang.org)** - Type safety
- **[React Hook Form](https://react-hook-form.com)** - Form management
- **[Zod](https://zod.dev)** - Schema validation
- **[Radix UI](https://www.radix-ui.com)** - Accessible UI components
- **[Alby Lightning Tools](https://github.com/getAlby/lightning-tools)** - Lightning Network integration

### Decentralized Features

- **NIP-01 Events**: Basic profile metadata and posts
- **NIP-05 Verification**: Human-readable identifiers
- **NIP-07 Browser Extension**: Seamless Nostr authentication
- **Real-time Subscriptions**: Live profile updates
- **Relay Redundancy**: 7+ Nostr relays for reliability
- **Lightning Integration**: Zap payments via Lightning Network

## 📱 User Happy Path

### 1. **Connect Your Nostr Identity**
- Install a Nostr browser extension (Alby, Nos2x, Flamingo)
- Generate or import your Nostr keypair
- Nostr Links connects directly to the Nostr network

### 2. **Create Your Profile**
- Your Nostr public key becomes your unique identifier
- Add a display name, bio, and profile picture
- Set up your Lightning address for zaps
- Choose from 20+ themes across 6 categories

### 3. **Customize Your Appearance**
- Select from Minimal, Vibrant, Professional, Creative, Retro, or Futuristic themes
- Each theme includes custom colors, fonts, effects, and animations
- Preview your profile in real-time

### 4. **Build Your Link Gallery**
- Add links to your Bitcoin content, social media, and projects
- Rich previews with automatic metadata extraction
- Drag-and-drop organization with custom positioning
- Support for various link types and wallet addresses

### 5. **Share Your Profile**
- Your profile URL: `yoursite.com/{nprofile}`
- NIP-05 identifier support for human-readable addresses
- Share on social media, embed in websites

### 6. **Receive Lightning Zaps**
- Fellow bitcoiners can zap you with predefined amounts (21, 100, 500, 1000, 2100 sats)
- Custom zap amounts up to 1,000,000 sats
- Instant Lightning Network payments
- No fees, no intermediaries

## 🎯 Key Benefits

### **You Own Your Data**
- Profile data stored on Nostr relays worldwide
- No company can delete your account or content
- Export your data anytime, migrate to any Nostr client

### **Censorship Resistant**
- Content distributed across multiple relays
- No single point of failure
- Resilient to platform shutdowns

### **Privacy First**
- No tracking, no analytics, no data collection
- Connect directly to Nostr relays
- Your keys, your control

### **Always Online**
- No server maintenance or downtime
- Content available as long as Nostr relays exist
- Decentralized hosting means no hosting costs

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run typecheck` - Run TypeScript compiler check
- `npm run check` - Run both linting and type checking
- `npm run format:check` - Check code formatting
- `npm run format:write` - Format code automatically

### Nostr Development

The app connects to multiple Nostr relays for redundancy:
- `wss://relay.damus.io`
- `wss://nos.lol`
- `wss://relay.snort.social`
- `wss://relay.primal.net`
- `wss://purplepag.es`
- `wss://nostr-pub.wellorder.net`
- `wss://relay.nostr.band`

### Environment Variables

Only one optional environment variable:
```bash
NEXT_PUBLIC_NOSTR_RELAYS="wss://your-relay.com,wss://another-relay.com"
```

### Theme System

The application includes a comprehensive theme system with:
- **6 Theme Categories**: Minimal, Vibrant, Professional, Creative, Retro, Futuristic
- **20+ Pre-built Themes**: Each with unique styling and effects
- **Custom CSS Classes**: Advanced styling capabilities
- **Real-time Preview**: See changes instantly
- **Responsive Design**: Themes adapt to all screen sizes

## 🔗 Links

- [Nostr Protocol](https://nostr.com) - The decentralized social protocol
- [NIPs](https://github.com/nostr-protocol/nips) - Nostr Improvement Proposals
- [Alby](https://getalby.com) - Popular Nostr browser extension
- [Damus](https://damus.io) - Popular Nostr client for iOS/Android
- [Lightning Network](https://lightning.network) - Bitcoin's layer 2 scaling solution
- [NDK Documentation](https://github.com/nostr-dev-kit/ndk) - Nostr Development Kit
- [Nostr Tools](https://github.com/nbd-wtf/nostr-tools) - Nostr protocol utilities

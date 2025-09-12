export const EVENT_KINDS = {
  PROFILE: 0, // NIP-01: Basic profile metadata
  PROFILE_DETAILS: 30001, // Custom: Extended profile data
  WALLETS: 30002, // Custom: Wallet addresses
  LINKS: 30003, // Custom: Link collection
  THEME: 30004, // Custom: Theme preferences
  ZAP_REQUEST: 9734, // NIP-57: Lightning zap request
  ZAP_RECEIPT: 9735, // NIP-57: Lightning zap receipt
} as const;

export type EventKind = (typeof EVENT_KINDS)[keyof typeof EVENT_KINDS];

export interface ProfileEvent {
  kind: typeof EVENT_KINDS.PROFILE;
  content: string;
  tags: string[][];
  pubkey: string;
  created_at: number;
}

export interface ProfileData {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string; // Lightning address
  website?: string;
}

export interface WalletEvent {
  kind: typeof EVENT_KINDS.WALLETS;
  content: string;
  tags: [["d", string]];
  pubkey: string;
  created_at: number;
}

export interface WalletData {
  lightning_address?: string;
  bitcoin_address?: string;
  ethereum_address?: string;
  solana_address?: string;
  doge_address?: string;
  monero_address?: string;
  main_wallet?:
    | "lightning"
    | "bitcoin"
    | "ethereum"
    | "solana"
    | "doge"
    | "monero";
}

export interface LinkEvent {
  kind: typeof EVENT_KINDS.LINKS;
  content: string;
  tags: [["d", string]];
  pubkey: string;
  created_at: number;
}

export interface LinkData {
  id: string;
  title: string;
  url: string;
  type: "link" | "wallet";
  description?: string;
  imageUrl?: string;
  image_url?: string;
  icon?: string;
  siteName?: string;
  author?: string;
  canonical?: string;
  themeColor?: string;
  publishedTime?: string;
  modifiedTime?: string;
  videoUrl?: string;
  audioUrl?: string;
  album?: string;
  artist?: string;
  genre?: string;
  releaseDate?: string;
  imageWidth?: number;
  imageHeight?: number;
  position: number;
  isActive?: boolean;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface ThemeEvent {
  kind: typeof EVENT_KINDS.THEME;
  content: string;
  tags: [["d", string]]; // [['d', 'theme']]
  pubkey: string;
  created_at: number;
}

export interface ThemeData {
  themeOption: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  custom_css?: string;
}

export interface ZapRequestEvent {
  kind: typeof EVENT_KINDS.ZAP_REQUEST;
  content: string;
  tags: string[][];
  pubkey: string;
  created_at: number;
}

export interface ZapReceiptEvent {
  kind: typeof EVENT_KINDS.ZAP_RECEIPT;
  content: string;
  tags: string[][];
  pubkey: string;
  created_at: number;
}

export interface ZapData {
  amount: number; // in millisats
  recipientPubkey: string;
  eventId?: string;
  content?: string;
  relays: string[];
}

export const createProfileEvent = (
  profileData: ProfileData,
): Omit<ProfileEvent, "pubkey" | "created_at"> => ({
  kind: EVENT_KINDS.PROFILE,
  content: JSON.stringify(profileData),
  tags: [],
});

export const createWalletEvent = (
  walletData: WalletData,
): Omit<WalletEvent, "pubkey" | "created_at"> => ({
  kind: EVENT_KINDS.WALLETS,
  content: JSON.stringify(walletData),
  tags: [["d", "wallets"]],
});

export const createLinkEvent = (
  linkData: LinkData,
): Omit<LinkEvent, "pubkey" | "created_at"> => ({
  kind: EVENT_KINDS.LINKS,
  content: JSON.stringify(linkData),
  tags: [["d", `link-${linkData.id}`]],
});

export const createThemeEvent = (
  themeData: ThemeData,
): Omit<ThemeEvent, "pubkey" | "created_at"> => ({
  kind: EVENT_KINDS.THEME,
  content: JSON.stringify(themeData),
  tags: [["d", "theme"]],
});

export const parseProfileContent = (content: string): ProfileData => {
  try {
    const parsed = JSON.parse(content) as ProfileData;
    return parsed;
  } catch {
    return {};
  }
};

export const parseWalletContent = (content: string): WalletData => {
  try {
    const parsed = JSON.parse(content) as WalletData;
    return parsed;
  } catch {
    return {};
  }
};

export const parseLinkContent = (content: string): LinkData => {
  try {
    const parsed = JSON.parse(content) as Partial<LinkData>;

    if (!parsed.type || (parsed.type !== "link" && parsed.type !== "wallet")) {
      parsed.type = "link";
    }
    return parsed as LinkData;
  } catch {
    return {
      id: "",
      title: "",
      url: "",
      type: "link",
      position: 0,
      is_active: false,
      created_at: 0,
      updated_at: 0,
    };
  }
};

export const parseThemeContent = (content: string): ThemeData => {
  try {
    const parsed = JSON.parse(content) as Partial<ThemeData>;
    parsed.themeOption ??= "default";

    return parsed as ThemeData;
  } catch {
    return {
      themeOption: "default",
    };
  }
};

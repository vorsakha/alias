export const EVENT_KINDS = {
  PROFILE: 0, // NIP-01: Basic profile metadata
  LINKS: 30003, // Custom: Link collection
  THEME: 30004, // Custom: Theme preferences
  ZAP_REQUEST: 9734, // NIP-57: Lightning zap request
} as const;

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

export interface ThemeData {
  themeOption: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  custom_css?: string;
}

export interface ZapData {
  amount: number; // in millisats
  recipientPubkey: string;
  eventId?: string;
  content?: string;
  relays: string[];
}

export const parseProfileContent = (content: string): ProfileData => {
  try {
    const parsed = JSON.parse(content) as ProfileData;
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

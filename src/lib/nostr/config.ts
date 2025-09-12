export const RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.primal.net",
  "wss://purplepag.es",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.nostr.band",
] as const;

export const DEFAULT_RELAYS = RELAYS.slice(0, 4);

export const NOSTR_CONFIG = {
  relays: DEFAULT_RELAYS,
  debug: process.env.NODE_ENV === "development",
  connectionTimeout: 5000, // 5 seconds
  queryTimeout: 10000, // 10 seconds
} as const;

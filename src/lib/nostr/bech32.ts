import { nip19 } from "nostr-tools";

export interface NProfileData {
  pubkey: string;
  relays: string[];
}

/**
 * Decodes an nprofile string and extracts the pubkey and relay information
 */
export function decodeNProfile(nprofile: string): NProfileData {
  try {
    const { type, data } = nip19.decode(nprofile);

    if (type !== "nprofile") {
      throw new Error(
        `Invalid nprofile format: expected nprofile, got ${type}`,
      );
    }

    const { pubkey, relays } = data as { pubkey: string; relays: string[] };

    return {
      pubkey,
      relays: relays || [],
    };
  } catch (error) {
    throw new Error(
      `Failed to decode nprofile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Encodes a pubkey to npub format
 */
export function encodeNpub(pubkey: string): string {
  try {
    return nip19.npubEncode(pubkey);
  } catch (error) {
    throw new Error(
      `Failed to encode npub: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Encodes a pubkey and relays to nprofile format
 */
export function encodeNProfile(pubkey: string, relays: string[] = []): string {
  try {
    return nip19.nprofileEncode({ pubkey, relays });
  } catch (error) {
    throw new Error(
      `Failed to encode nprofile: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

import { nip19 } from "nostr-tools";

export interface NProfileData {
  pubkey: string;
  relays: string[];
}

export interface NEventData {
  id: string;
  relays: string[];
  author?: string;
  kind?: number;
}

export interface NAddrData {
  identifier: string;
  pubkey: string;
  kind: number;
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
 * Decodes an npub string and extracts the pubkey
 */
export function decodeNpub(npub: string): string {
  try {
    const { type, data } = nip19.decode(npub);

    if (type !== "npub") {
      throw new Error(`Invalid npub format: expected npub, got ${type}`);
    }

    return data;
  } catch (error) {
    throw new Error(
      `Failed to decode npub: ${error instanceof Error ? error.message : "Unknown error"}`,
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

/**
 * Decodes an nevent string and extracts the event information
 */
export function decodeNEvent(nevent: string): NEventData {
  try {
    const { type, data } = nip19.decode(nevent);

    if (type !== "nevent") {
      throw new Error(`Invalid nevent format: expected nevent, got ${type}`);
    }

    const { id, relays, author, kind } = data as {
      id: string;
      relays: string[];
      author?: string;
      kind?: number;
    };

    return {
      id,
      relays: relays || [],
      author,
      kind,
    };
  } catch (error) {
    throw new Error(
      `Failed to decode nevent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Decodes an naddr string and extracts the address information
 */
export function decodeNAddr(naddr: string): NAddrData {
  try {
    const { type, data } = nip19.decode(naddr);

    if (type !== "naddr") {
      throw new Error(`Invalid naddr format: expected naddr, got ${type}`);
    }

    const { identifier, pubkey, kind, relays } = data as {
      identifier: string;
      pubkey: string;
      kind: number;
      relays: string[];
    };

    return {
      identifier,
      pubkey,
      kind,
      relays: relays || [],
    };
  } catch (error) {
    throw new Error(
      `Failed to decode naddr: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Validates if a string is a valid nprofile
 */
export function isValidNProfile(input: string): boolean {
  try {
    const { type } = nip19.decode(input);
    return type === "nprofile";
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid npub
 */
export function isValidNpub(input: string): boolean {
  try {
    const { type } = nip19.decode(input);
    return type === "npub";
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid nevent
 */
export function isValidNEvent(input: string): boolean {
  try {
    const { type } = nip19.decode(input);
    return type === "nevent";
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid naddr
 */
export function isValidNAddr(input: string): boolean {
  try {
    const { type } = nip19.decode(input);
    return type === "naddr";
  } catch {
    return false;
  }
}

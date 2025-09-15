import NDK from "@nostr-dev-kit/ndk";
import { NOSTR_CONFIG } from "./config";
import { EVENT_KINDS, parseProfileContent } from "./events";
import { decodeNProfile } from "./bech32";
import type { ProfileData } from "./events";

function createServerNDK(relays?: string[]): NDK {
  const relayUrls =
    relays && relays.length > 0
      ? [...relays, ...NOSTR_CONFIG.relays]
      : NOSTR_CONFIG.relays;

  const uniqueRelayUrls = [...new Set(relayUrls)];

  return new NDK({
    explicitRelayUrls: uniqueRelayUrls,
  });
}

export async function getServerProfileFromNProfile(
  nprofile: string,
): Promise<ProfileData | null> {
  try {
    const { pubkey, relays } = decodeNProfile(nprofile);

    const ndk = createServerNDK(relays);

    await ndk.connect();

    const events = await ndk.fetchEvents({
      kinds: [EVENT_KINDS.PROFILE],
      authors: [pubkey],
      limit: 1,
    });

    const event = Array.from(events)[0];
    if (!event || typeof event !== "object" || !("content" in event)) {
      return null;
    }

    return parseProfileContent((event as { content: string }).content);
  } catch (error) {
    console.error("Failed to fetch profile from nprofile for metadata:", error);

    return null;
  }
}

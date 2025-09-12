import type { NostrEvent } from "@nostr-dev-kit/ndk";

export class NostrAuth {
  static async getPublicKey(): Promise<string | null> {
    if (typeof window !== "undefined" && window.nostr) {
      try {
        return await window.nostr.getPublicKey();
      } catch (error) {
        console.error("Failed to get public key from extension:", error);
        throw new Error("Nostr extension not found or access denied");
      }
    }
    throw new Error("Nostr extension not available");
  }

  static async signEvent(event: NostrEvent): Promise<NostrEvent> {
    if (typeof window !== "undefined" && window.nostr) {
      try {
        const signedEvent = await window.nostr.signEvent(event);

        return {
          ...event,
          sig: signedEvent.sig,
        };
      } catch (error) {
        console.error("Failed to sign event:", error);
        throw new Error("Failed to sign event with Nostr extension");
      }
    }
    throw new Error("Nostr extension not available");
  }

  static async isExtensionAvailable(): Promise<boolean> {
    return typeof window !== "undefined" && !!window.nostr;
  }

  static async requestPermissions(): Promise<boolean> {
    if (!(await this.isExtensionAvailable())) {
      return false;
    }

    try {
      // Test extension by requesting public key
      await this.getPublicKey();
      return true;
    } catch {
      return false;
    }
  }
}

// WebLN type definitions (NIP-07 types are provided by @nostr-dev-kit/ndk)
declare global {
  interface Window {
    webln?: {
      enable(): Promise<void>;
      sendPayment(paymentRequest: string): Promise<{ preimage: string }>;
    };
  }
}

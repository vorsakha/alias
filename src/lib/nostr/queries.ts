import type NDK from "@nostr-dev-kit/ndk";
import type {
  ProfileData,
  WalletData,
  LinkData,
  ThemeData,
  ZapData,
} from "./events";
import {
  EVENT_KINDS,
  parseProfileContent,
  parseWalletContent,
  parseLinkContent,
  parseThemeContent,
} from "./events";
import { LightningAddress } from "@getalby/lightning-tools";
import { NOSTR_CONFIG } from "./config";
import { toast } from "sonner";

export class NostrQueries {
  private ndk: NDK;

  constructor(ndk: NDK) {
    this.ndk = ndk;
  }

  private async fetchEventsWithTimeout(
    filter: Parameters<typeof this.ndk.fetchEvents>[0],
    options: Parameters<typeof this.ndk.fetchEvents>[1] = {},
  ): Promise<Set<unknown>> {
    return Promise.race([
      this.ndk.fetchEvents(filter, { ...options, closeOnEose: true }),

      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Query timeout")),
          NOSTR_CONFIG.queryTimeout as number,
        ),
      ),
    ]);
  }

  async getProfile(pubkey: string): Promise<ProfileData | null> {
    try {
      const events = await this.fetchEventsWithTimeout({
        kinds: [EVENT_KINDS.PROFILE],
        authors: [pubkey],
        limit: 1,
      });

      const event = Array.from(events)[0];
      if (!event || typeof event !== "object" || !("content" in event))
        return null;

      return parseProfileContent((event as { content: string }).content);
    } catch (error) {
      console.error("Failed to fetch profile:", error);

      throw new Error(
        `Failed to fetch profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getProfileDetails(
    pubkey: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      const events = await this.fetchEventsWithTimeout({
        kinds: [EVENT_KINDS.PROFILE_DETAILS],
        authors: [pubkey],
        limit: 1,
      });

      const event = Array.from(events)[0];
      if (!event || typeof event !== "object" || !("content" in event))
        return null;

      return JSON.parse((event as { content: string }).content) as Record<
        string,
        unknown
      >;
    } catch (error) {
      console.error("Failed to fetch profile details:", error);

      throw new Error(
        `Failed to fetch profile details: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getWallets(pubkey: string): Promise<WalletData | null> {
    try {
      const events = await this.fetchEventsWithTimeout({
        kinds: [EVENT_KINDS.WALLETS],
        authors: [pubkey],
        "#d": ["wallets"],
        limit: 1,
      });

      const event = Array.from(events)[0];
      if (!event || typeof event !== "object" || !("content" in event))
        return null;

      return parseWalletContent((event as { content: string }).content);
    } catch (error) {
      console.error("Failed to fetch wallets:", error);

      throw new Error(
        `Failed to fetch wallets: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getLinks(pubkey: string): Promise<LinkData[]> {
    try {
      const events = await this.fetchEventsWithTimeout({
        kinds: [EVENT_KINDS.LINKS],
        authors: [pubkey],
      });

      return Array.from(events)
        .map((event) =>
          parseLinkContent((event as { content: string }).content),
        )
        .filter((link) => link?.is_active)
        .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));
    } catch (error) {
      console.error("Failed to fetch links:", error);

      throw new Error(
        `Failed to fetch links: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getLink(pubkey: string, linkId: string): Promise<LinkData | null> {
    try {
      const events = await this.fetchEventsWithTimeout({
        kinds: [EVENT_KINDS.LINKS],
        authors: [pubkey],
        "#d": [`link-${linkId}`],
        limit: 1,
      });

      const event = Array.from(events)[0];
      if (!event || typeof event !== "object" || !("content" in event))
        return null;

      return parseLinkContent((event as { content: string }).content);
    } catch (error) {
      console.error("Failed to fetch link:", error);

      throw new Error(
        `Failed to fetch link: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getTheme(pubkey: string): Promise<ThemeData | null> {
    try {
      const events = await this.fetchEventsWithTimeout({
        kinds: [EVENT_KINDS.THEME],
        authors: [pubkey],
        "#d": ["theme"],
        limit: 1,
      });

      const event = Array.from(events)[0];
      if (!event || typeof event !== "object" || !("content" in event))
        return null;

      return parseThemeContent((event as { content: string }).content);
    } catch (error) {
      console.error("Failed to fetch theme:", error);

      throw new Error(
        `Failed to fetch theme: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async publishProfile(profileData: ProfileData): Promise<boolean> {
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;
      const event = new NDKEvent(this.ndk, {
        kind: EVENT_KINDS.PROFILE,
        content: JSON.stringify(profileData),
        tags: [],
      });

      await event.publish();
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Failed to publish profile:", error);
      toast.error("Failed to update profile. Please try again.");

      return false;
    }
  }

  async publishWallets(walletData: WalletData): Promise<boolean> {
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;
      const event = new NDKEvent(this.ndk, {
        kind: EVENT_KINDS.WALLETS,
        content: JSON.stringify(walletData),
        tags: [["d", "wallets"]],
      });

      await event.publish();
      toast.success("Wallet information updated successfully!");
      return true;
    } catch (error) {
      console.error("Failed to publish wallets:", error);
      toast.error("Failed to update wallet information. Please try again.");

      return false;
    }
  }

  async publishLink(linkData: LinkData): Promise<boolean> {
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;
      const event = new NDKEvent(this.ndk, {
        kind: EVENT_KINDS.LINKS,
        content: JSON.stringify(linkData),
        tags: [["d", `link-${linkData.id}`]],
      });

      await event.publish();
      toast.success("Link added successfully!");

      return true;
    } catch (error) {
      console.error("Failed to publish link:", error);
      toast.error("Failed to add link. Please try again.");

      return false;
    }
  }

  async publishTheme(themeData: ThemeData): Promise<boolean> {
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;
      const event = new NDKEvent(this.ndk, {
        kind: EVENT_KINDS.THEME,
        content: JSON.stringify(themeData),
        tags: [["d", "theme"]],
      });

      await event.publish();
      toast.success("Theme updated successfully!");

      return true;
    } catch (error) {
      console.error("Failed to publish theme:", error);
      toast.error("Failed to update theme. Please try again.");

      return false;
    }
  }

  async deleteLink(linkId: string): Promise<boolean> {
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;
      const event = new NDKEvent(this.ndk, {
        kind: 5, // Deletion event
        content: "",
        tags: [["e", linkId]], // Reference the event to delete
      });

      await event.publish();
      toast.success("Link deleted successfully!");

      return true;
    } catch (error) {
      console.error("Failed to delete link:", error);
      toast.error("Failed to delete link. Please try again.");

      return false;
    }
  }

  // Subscription methods for real-time updates
  subscribeToProfile(
    pubkey: string,
    callback: (profile: ProfileData | null) => void,
  ) {
    const subscription = this.ndk.subscribe({
      kinds: [EVENT_KINDS.PROFILE],
      authors: [pubkey],
    });

    subscription.on("event", (event: unknown) => {
      if (event && typeof event === "object" && "content" in event) {
        const profile = parseProfileContent(
          (event as { content: string }).content,
        );
        callback(profile);
      }
    });

    return subscription;
  }

  subscribeToWallets(
    pubkey: string,
    callback: (wallets: WalletData | null) => void,
  ) {
    const subscription = this.ndk.subscribe({
      kinds: [EVENT_KINDS.WALLETS],
      authors: [pubkey],
      "#d": ["wallets"],
    });

    subscription.on("event", (event: unknown) => {
      if (event && typeof event === "object" && "content" in event) {
        const wallets = parseWalletContent(
          (event as { content: string }).content,
        );
        callback(wallets);
      }
    });

    return subscription;
  }

  subscribeToLinks(pubkey: string, callback: (links: LinkData[]) => void) {
    const subscription = this.ndk.subscribe({
      kinds: [EVENT_KINDS.LINKS],
      authors: [pubkey],
    });

    subscription.on("event", () => {
      void this.getLinks(pubkey).then(callback);
    });

    return subscription;
  }

  async createZapRequest(zapData: ZapData): Promise<string> {
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;

      const event = new NDKEvent(this.ndk, {
        kind: EVENT_KINDS.ZAP_REQUEST,
        content: zapData.content ?? "",
        tags: [
          ["relays", ...zapData.relays],
          ["amount", zapData.amount.toString()],
          ["lnurl", zapData.recipientPubkey],
          ["p", zapData.recipientPubkey],
          ...(zapData.eventId ? [["e", zapData.eventId]] : []),
        ],
      });

      await event.sign();
      return JSON.stringify(event.rawEvent());
    } catch (error) {
      console.error("Failed to create zap request:", error);
      toast.error("Failed to create zap request. Please try again.");

      throw error;
    }
  }

  async sendZap(
    lightningAddress: string,
    amount: number,
    zapRequest: string,
  ): Promise<boolean> {
    try {
      const ln = new LightningAddress(lightningAddress);

      await ln.fetch();

      if (!ln.lnurlpData) {
        throw new Error("Lightning address does not support LNURL-pay");
      }

      if (typeof ln.zap === "function") {
        try {
          const response = await (
            ln.zap as (params: {
              satoshi: number;
              comment: string;
              relays: string[];
              e: string;
            }) => Promise<{ preimage?: string }>
          )({
            satoshi: amount,
            comment: "Zap via Nostr",
            relays: ["wss://nostr-pub.wellorder.net", "wss://relay.damus.io"],
            e: zapRequest,
          });

          if (
            response &&
            typeof response === "object" &&
            "preimage" in response
          ) {
            toast.success("Zap sent successfully!");

            return true;
          }
        } catch (zapError) {
          console.warn(
            "Zap method failed, falling back to regular invoice:",
            zapError,
          );
        }
      }

      const invoice = await ln.requestInvoice({
        satoshi: amount,
        comment: "Zap via Nostr",
      });

      if (!invoice.paymentRequest) {
        throw new Error("Failed to generate payment request");
      }

      if (typeof window !== "undefined" && window.webln) {
        try {
          await window.webln.enable();
          const response = await window.webln.sendPayment(
            invoice.paymentRequest,
          );

          if (response.preimage) {
            toast.success("Payment sent successfully!");

            return true;
          }
        } catch (weblnError) {
          console.warn(
            "WebLN payment failed, falling back to external wallet:",
            weblnError,
          );
        }
      }

      if (typeof window !== "undefined") {
        try {
          window.open(`lightning:${invoice.paymentRequest}`, "_blank");
          toast.info("Opening Lightning wallet...");
        } catch {
          try {
            await navigator.clipboard.writeText(invoice.paymentRequest);
            toast.info(
              "Payment request copied to clipboard. Please paste it into your Lightning wallet.",
            );
          } catch {
            toast.error(
              "Unable to open Lightning wallet. Please copy the payment request manually.",
            );

            alert(
              `Please pay this invoice in your Lightning wallet:\n\n${invoice.paymentRequest}`,
            );
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to send zap:", error);

      if (error instanceof Error) {
        if (error.message.includes("CORS")) {
          throw new Error(
            "Unable to connect to Lightning service. Please try again or check your internet connection.",
          );
        } else if (error.message.includes("Invalid lightning address")) {
          throw new Error(
            "Invalid Lightning address format. Please check the address and try again.",
          );
        } else if (error.message.includes("does not support LNURL-pay")) {
          throw new Error(
            "This Lightning address does not support receiving payments. Please contact the recipient.",
          );
        }
      }

      throw new Error("Failed to process Lightning payment. Please try again.");
    }
  }

  async publishZapReceipt(
    zapRequestId: string,
    recipientPubkey: string,
    bolt11Invoice: string,
  ): Promise<boolean> {
    try {
      const NDKEvent = (await import("@nostr-dev-kit/ndk")).NDKEvent;

      const event = new NDKEvent(this.ndk, {
        kind: EVENT_KINDS.ZAP_RECEIPT,
        content: "",
        tags: [
          ["p", recipientPubkey],
          ["e", zapRequestId],
          ["bolt11", bolt11Invoice],
          ["description", "Zap receipt"],
        ],
      });

      await event.publish();
      return true;
    } catch (error) {
      console.error("Failed to publish zap receipt:", error);

      return false;
    }
  }
}

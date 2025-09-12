"use client";

import type { NProfileData } from "./bech32";

export interface NostrSessionData {
  isConnected: boolean;
  hasSigner: boolean;
  userPubkey?: string;
  userNpub?: string;
  nprofileData?: NProfileData;
  lastConnectedAt: number;
  relayUrls: string[];
}

const SESSION_KEY = "nostr-links-session";

export class NostrSessionStorage {
  static saveSession(sessionData: Partial<NostrSessionData>): void {
    if (typeof window === "undefined") return;

    try {
      const existingSession = this.getSession();
      const updatedSession: NostrSessionData = {
        isConnected: sessionData.isConnected ?? false,
        hasSigner: sessionData.hasSigner ?? false,
        userPubkey: sessionData.userPubkey,
        userNpub: sessionData.userNpub,
        nprofileData: sessionData.nprofileData,
        lastConnectedAt: sessionData.lastConnectedAt ?? Date.now(),
        relayUrls: sessionData.relayUrls ?? existingSession?.relayUrls ?? [],
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    } catch (error) {
      console.error("Failed to save Nostr session:", error);
    }
  }

  static getSession(): NostrSessionData | null {
    if (typeof window === "undefined") return null;

    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const parsed = JSON.parse(sessionData) as NostrSessionData;
      return parsed;
    } catch (error) {
      console.error("Failed to get Nostr session:", error);
      this.clearSession();

      return null;
    }
  }

  static clearSession(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("Failed to clear Nostr session:", error);
    }
  }

  static updateConnectionState(
    isConnected: boolean,
    connectedRelayCount: number,
  ): void {
    const session = this.getSession();

    if (session) {
      this.saveSession({
        ...session,
        isConnected: isConnected && connectedRelayCount > 0,
      });
    }
  }

  static updateUserData(userPubkey?: string, userNpub?: string): void {
    const session = this.getSession();

    if (session) {
      this.saveSession({
        ...session,
        userPubkey,
        userNpub,
      });
    }
  }

  static updateNProfileData(nprofileData?: NProfileData): void {
    const session = this.getSession();

    if (session) {
      this.saveSession({
        ...session,
        nprofileData,
      });
    }
  }

  static updateRelayUrls(relayUrls: string[]): void {
    const session = this.getSession();

    if (session) {
      this.saveSession({
        ...session,
        relayUrls,
      });
    }
  }

  static isSessionValid(): boolean {
    const session = this.getSession();
    return Boolean(session?.hasSigner);
  }

  static shouldAutoReconnect(): boolean {
    const session = this.getSession();
    if (!session) return false;

    return Boolean(session.hasSigner);
  }
}

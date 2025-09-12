"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { NostrQueries } from "./queries";
import { RELAYS, NOSTR_CONFIG } from "./config";
import { decodeNProfile, type NProfileData } from "./bech32";
import { NostrSessionStorage } from "./session-storage";
import { toast } from "sonner";

interface RelayInfo {
  url: string;
  disconnect?: () => void;
}

interface PoolInfo {
  relays?: Map<string, RelayInfo>;
  on?: (event: string, callback: (relay: RelayInfo) => void) => void;
  off?: (event: string, callback: (relay: RelayInfo) => void) => void;
  removeAllListeners?: () => void;
}

interface NDKWithPool {
  pool: PoolInfo;
}

interface NProfileContextType {
  ndk: NDK | null;
  queries: NostrQueries | null;
  isConnected: boolean;
  connectedRelayCount: number;
  hasSigner: boolean;
  nprofileData: NProfileData | null;
  isInitializing: boolean;
  sessionRestored: boolean;
  connectToNProfile: (nprofile: string) => Promise<void>;
  connect: (relayUrls?: string[]) => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
}

const NProfileContext = createContext<NProfileContextType | undefined>(
  undefined,
);

interface NProfileProviderProps {
  children: ReactNode;
}

/**
 * Utility: dedupe and normalize relay URLs
 */
function normalizeRelays(relays: string[]): string[] {
  return Array.from(
    new Set(
      relays
        .filter(Boolean)
        .map((r) => r.trim())
        .filter((r) => r.startsWith("ws://") || r.startsWith("wss://")),
    ),
  );
}

/**
 * Utility: wait until at least one relay connects, or timeout
 */
async function waitForFirstRelay(
  pool: PoolInfo,
  hasAnyConnected: () => boolean,
  timeoutMs: number,
): Promise<boolean> {
  if (hasAnyConnected()) return true;

  return new Promise<boolean>((resolve) => {
    let done = false;

    const onConnect = () => {
      if (done) return;
      done = true;
      try {
        pool.off?.("relay:connect", onConnect);
      } catch {
        /* noop */
      }
      resolve(true);
    };

    try {
      pool.on?.("relay:connect", onConnect);
    } catch {
      /* noop */
    }

    const t = window.setTimeout(() => {
      if (done) return;
      done = true;
      try {
        pool.off?.("relay:connect", onConnect);
      } catch {
        /* noop */
      }
      resolve(false);
    }, timeoutMs);

    if (hasAnyConnected() && !done) {
      window.clearTimeout(t);
      done = true;
      try {
        pool.off?.("relay:connect", onConnect);
      } catch {
        /* noop */
      }
      resolve(true);
    }
  });
}

export function NProfileProvider({ children }: NProfileProviderProps) {
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [queries, setQueries] = useState<NostrQueries | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasSigner, setHasSigner] = useState(false);
  const [nprofileData, setNprofileData] = useState<NProfileData | null>(null);
  const connectedRelaysRef = useRef<Set<string>>(new Set());
  const [connectedRelayCount, setConnectedRelayCount] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionRestored, setSessionRestored] = useState(false);

  const poolListenersCleanupRef = useRef<(() => void) | null>(null);

  const connectAbortRef = useRef<AbortController | null>(null);

  const signerToastShownRef = useRef(false);

  const detachRelayListeners = useCallback(() => {
    try {
      poolListenersCleanupRef.current?.();
    } catch {
      /* noop */
    }
    poolListenersCleanupRef.current = null;
  }, []);

  const attachRelayListeners = useCallback(
    (instance: NDK) => {
      detachRelayListeners();

      connectedRelaysRef.current = new Set<string>();
      setConnectedRelayCount(0);

      const onRelayConnect = (relay: RelayInfo) => {
        connectedRelaysRef.current.add(relay.url);
        setConnectedRelayCount(connectedRelaysRef.current.size);
      };

      const onRelayDisconnect = (relay: RelayInfo) => {
        connectedRelaysRef.current.delete(relay.url);
        setConnectedRelayCount(connectedRelaysRef.current.size);
      };

      instance.pool.on("relay:connect", onRelayConnect);
      instance.pool.on("relay:disconnect", onRelayDisconnect);

      poolListenersCleanupRef.current = () => {
        try {
          instance.pool.off?.("relay:connect", onRelayConnect);
        } catch {
          /* noop */
        }
        try {
          instance.pool.off?.("relay:disconnect", onRelayDisconnect);
        } catch {
          /* noop */
        }
      };
    },
    [detachRelayListeners],
  );

  const safeDestroyNdk = useCallback(
    async (instance: NDK | null) => {
      if (!instance) return;

      detachRelayListeners();

      try {
        const ndkWithPool = instance as NDKWithPool;
        const relays = Array.from(ndkWithPool.pool?.relays?.values?.() ?? []);
        for (const relay of relays) {
          try {
            relay.disconnect?.();
          } catch {
            /* noop */
          }
        }
      } catch {
        /* noop */
      }

      try {
        const ndkWithPool = instance as NDKWithPool;
        ndkWithPool.pool?.removeAllListeners?.();
      } catch {
        /* noop */
      }
    },
    [detachRelayListeners],
  );

  const createSignerIfAvailable = useCallback(():
    | NDKNip07Signer
    | undefined => {
    if (typeof window !== "undefined" && window.nostr) {
      try {
        const signer = new NDKNip07Signer();
        setHasSigner(true);
        return signer;
      } catch (error) {
        console.warn("NIP-07 signer setup failed:", error);
        setHasSigner(false);
        return undefined;
      }
    } else {
      setHasSigner(false);
      return undefined;
    }
  }, []);

  const internalConnect = useCallback(
    async (
      relayUrls: string[] | undefined,
      nprofile: NProfileData | null,
    ): Promise<void> => {
      connectAbortRef.current?.abort();
      const abort = new AbortController();
      connectAbortRef.current = abort;

      const signer = createSignerIfAvailable();
      if (!signer && !signerToastShownRef.current) {
        toast.error(
          "NIP-07 signer not available - no browser extension detected.",
        );
        signerToastShownRef.current = true;
      }

      const explicitRelayUrls =
        relayUrls && relayUrls.length > 0
          ? normalizeRelays(relayUrls)
          : normalizeRelays([...RELAYS]);

      const newNdk = new NDK({
        explicitRelayUrls,
        enableOutboxModel: true,
        clientName: "Nostr Links",
        signer,
      });

      attachRelayListeners(newNdk);

      try {
        await newNdk.connect(NOSTR_CONFIG.connectionTimeout as number);

        const ndkWithPool = newNdk as NDKWithPool;
        const ok = await waitForFirstRelay(
          ndkWithPool.pool,
          () => connectedRelaysRef.current.size > 0,
          (NOSTR_CONFIG.connectionTimeout as number) + 3000,
        );

        if (abort.signal.aborted) {
          await safeDestroyNdk(newNdk);
          return;
        }

        if (!ok) {
          await safeDestroyNdk(newNdk);
          setIsConnected(false);
          setNdk(null);
          setQueries(null);
          setNprofileData(nprofile);
          toast.error("No relays reachable. Please try again later.");

          throw new Error("No relays connected");
        }

        if (signer) {
          try {
            const user = await signer.user();
            newNdk.activeUser = user;
            NostrSessionStorage.updateUserData(user.pubkey, user.npub);
          } catch (error) {
            console.warn("Failed to get user from signer:", error);
          }
        }

        const newQueries = new NostrQueries(newNdk);

        setNdk(newNdk);
        setQueries(newQueries);

        NostrSessionStorage.saveSession({
          isConnected: true,
          hasSigner: !!signer,
          userPubkey: newNdk.activeUser?.pubkey,
          userNpub: newNdk.activeUser?.npub,
          nprofileData: nprofile ?? undefined,
          lastConnectedAt: Date.now(),
          relayUrls: explicitRelayUrls,
        });
      } catch (err) {
        if (abort.signal.aborted) {
          await safeDestroyNdk(newNdk);
          return;
        }
        console.error("NDK connect error:", err);
        await safeDestroyNdk(newNdk);
        setIsConnected(false);
        setNdk(null);
        setQueries(null);
        if (!(err instanceof Error && err.message === "No relays connected")) {
          toast.error(
            "Failed to connect to Nostr network. Check your internet and try again.",
          );
        }
        throw err;
      } finally {
        if (connectAbortRef.current === abort) {
          connectAbortRef.current = null;
        }
      }
    },
    [attachRelayListeners, createSignerIfAvailable, safeDestroyNdk],
  );

  const connectToNProfile = useCallback(
    async (nprofile: string) => {
      try {
        const decoded = decodeNProfile(nprofile);
        setNprofileData(decoded);

        const relayUrls =
          decoded.relays.length > 0
            ? normalizeRelays([...decoded.relays, ...RELAYS])
            : normalizeRelays([...RELAYS]);

        await internalConnect(relayUrls, decoded);
      } catch (error) {
        console.error("Failed to connect to nprofile:", error);
        setIsConnected(false);
        setNprofileData(null);
        toast.error(
          "Failed to connect to Nostr network. Please check your internet connection and try again.",
        );
      }
    },
    [internalConnect],
  );

  const connect = useCallback(
    async (relayUrls?: string[]) => {
      await internalConnect(
        relayUrls ? normalizeRelays(relayUrls) : undefined,
        nprofileData,
      );
    },
    [internalConnect, nprofileData],
  );

  const disconnect = useCallback(async () => {
    connectAbortRef.current?.abort();

    if (ndk) {
      await safeDestroyNdk(ndk);
    }

    setIsConnected(false);
    setNdk(null);
    setQueries(null);
    setNprofileData(null);
    connectedRelaysRef.current = new Set<string>();
    setConnectedRelayCount(0);

    NostrSessionStorage.clearSession();
  }, [ndk, safeDestroyNdk]);

  const reconnect = useCallback(async () => {
    const saved = NostrSessionStorage.getSession();
    const relays = saved?.relayUrls?.length ? saved.relayUrls : [...RELAYS];

    await disconnect();
    await connect(relays);
  }, [connect, disconnect]);

  useEffect(() => {
    const initializeSession = async () => {
      setIsInitializing(true);

      try {
        const savedSession = NostrSessionStorage.getSession();

        if (savedSession && NostrSessionStorage.shouldAutoReconnect()) {
          setHasSigner(savedSession.hasSigner);
          setNprofileData(savedSession.nprofileData ?? null);

          try {
            await connect(
              savedSession.relayUrls?.length
                ? savedSession.relayUrls
                : [...RELAYS],
            );
            setSessionRestored(true);
          } catch (error) {
            console.warn("Failed to restore session, clearing storage:", error);
            await disconnect();
            setSessionRestored(false);
          }
        } else {
          setSessionRestored(false);
        }
      } catch (error) {
        console.error("Session initialization failed:", error);
        await disconnect();
        setSessionRestored(false);
      } finally {
        setIsInitializing(false);
      }
    };

    void initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkSigner = () => {
      if (typeof window !== "undefined" && window.nostr) {
        setHasSigner(true);
      } else {
        setHasSigner(false);
      }
    };

    checkSigner();
    const interval = window.setInterval(checkSigner, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const newIsConnected = connectedRelayCount > 0;
    setIsConnected(newIsConnected);

    NostrSessionStorage.updateConnectionState(
      newIsConnected,
      connectedRelayCount,
    );
  }, [connectedRelayCount]);

  useEffect(() => {
    if (isInitializing) return;

    const timeout = window.setTimeout(() => {
      if (!isConnected && !sessionRestored) {
        console.warn("Connection timeout - no relays connected");
        toast.error("Connection timeout - no relays connected");
        setIsConnected(false);
      }
    }, 15000);

    return () => window.clearTimeout(timeout);
  }, [isConnected, isInitializing, sessionRestored]);

  useEffect(() => {
    const onFocus = () => {
      if (!isConnected && !isInitializing) {
        const saved = NostrSessionStorage.getSession();
        const relays = saved?.relayUrls?.length ? saved.relayUrls : [...RELAYS];
        void connect(relays);
      }
    };

    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [connect, isConnected, isInitializing]);

  const value: NProfileContextType = {
    ndk,
    queries,
    isConnected,
    hasSigner,
    connectedRelayCount,
    nprofileData,
    isInitializing,
    sessionRestored,
    connectToNProfile,
    connect,
    disconnect,
    reconnect,
  };

  return (
    <NProfileContext.Provider value={value}>
      {children}
    </NProfileContext.Provider>
  );
}

export function useNostr(): NProfileContextType {
  const context = useContext(NProfileContext);
  if (context === undefined) {
    throw new Error("useNostr must be used within a NProfileProvider");
  }
  return context;
}

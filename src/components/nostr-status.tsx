"use client";

import { useState, useEffect } from "react";
import { useNostr } from "@/lib/nostr/nprofile-provider";
import { Button } from "@/components/ui/button";

export function NostrStatus() {
  const { isConnected, hasSigner, connect, disconnect, reconnect, ndk } =
    useNostr();
  const [signerUser, setSignerUser] = useState<string | null>(null);

  useEffect(() => {
    if (ndk?.activeUser) {
      setSignerUser(ndk.activeUser.npub);
    } else {
      setSignerUser(null);
    }
  }, [ndk?.activeUser]);

  const getStatusText = () => {
    if (!hasSigner) {
      return "Browser extension not detected";
    }
    if (!isConnected) {
      return "Disconnected";
    }
    if (signerUser) {
      return `Connected as ${signerUser.slice(0, 12)}...`;
    }
    return "Connected";
  };

  const getStatusColor = () => {
    if (!hasSigner) return "bg-orange-500";
    if (!isConnected) return "bg-red-500";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">{getStatusText()}</span>
          {!hasSigner && (
            <span className="text-xs text-orange-400">
              Install Alby or Nos2x extension
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => (isConnected ? disconnect() : connect())}
          variant="outline"
          size="sm"
          className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
          disabled={!hasSigner && !isConnected}
        >
          {!hasSigner && !isConnected
            ? "Install Nostr Extension"
            : isConnected
              ? "Disconnect"
              : "Connect to Nostr"}
        </Button>

        {isConnected && (
          <Button
            onClick={reconnect}
            variant="outline"
            size="sm"
            className="border-gray-500/20 text-gray-400 hover:bg-gray-500/10"
          >
            Reconnect
          </Button>
        )}
      </div>

      {hasSigner && (
        <div className="max-w-xs text-center text-xs text-gray-500">
          Using NIP-07 browser extension for secure signing
        </div>
      )}
    </div>
  );
}

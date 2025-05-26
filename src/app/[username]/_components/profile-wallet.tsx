import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clipboard, Check, AlertTriangle } from "lucide-react";
import { WalletType, type Wallets } from "@prisma/client";
import { getQrValue, getWalletDisplayName } from "../_utils";
import { getMainWalletAddress } from "../_utils";

interface WalletDisplayProps {
  wallets: Wallets;
}

export function WalletDisplay({ wallets }: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);
  const mainWalletAddress = getMainWalletAddress(wallets);

  if (!mainWalletAddress) {
    return (
      <div className="my-6 w-full rounded-lg border border-dashed border-gray-700 bg-gray-800/50 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <AlertTriangle size={18} />
          <span className="text-sm">
            No primary wallet configured for tips.
          </span>
        </div>
      </div>
    );
  }

  const copyToClipboard = async () => {
    if (mainWalletAddress) {
      await navigator.clipboard.writeText(mainWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const walletTypeDisplayName = getWalletDisplayName(
    wallets.mainWallet ?? WalletType.LIGHTNING,
  );
  const qrValue = getQrValue(wallets);

  return (
    <div className="mb-8 w-full rounded-xl bg-gray-900/70 p-5 shadow-lg">
      <div className="mb-2 text-center">
        <span className="text-xs font-medium tracking-wider text-amber-400 uppercase">
          Tip with {walletTypeDisplayName}
        </span>
      </div>
      <div className="mb-3 text-center text-xs text-gray-400">
        Scan QR or copy address below
      </div>
      <div className="mx-auto mb-4 flex w-fit items-center justify-center rounded-lg bg-white p-2.5 shadow-md">
        <QRCodeSVG
          value={qrValue}
          size={140}
          level="M"
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <p className="font-mono text-xs break-all text-gray-400">
          {mainWalletAddress}
        </p>
        <button
          onClick={copyToClipboard}
          className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-700/60 p-1.5 text-gray-300 transition-all hover:bg-gray-600/80"
          title="Copy address"
        >
          {copied ? (
            <Check size={16} className="text-amber-400" />
          ) : (
            <Clipboard size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clipboard, Check, Coins } from "lucide-react";
import { WalletType, type Wallets } from "@prisma/client";
import { getQrValue, getWalletDisplayName } from "../_utils";
import { getMainWalletAddress } from "../_utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { applyThemeClasses, type ThemeConfig } from "@/app/_constants/theme";

interface TippingButtonProps {
  wallets: Wallets;
  theme: ThemeConfig;
}

export function TippingButton({ wallets, theme }: TippingButtonProps) {
  const [copied, setCopied] = useState(false);
  const mainWalletAddress = getMainWalletAddress(wallets);

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

  const buttonClasses = applyThemeClasses(theme, "button");

  const getButtonExtraClasses = () => {
    if (theme.hasGlowEffects) {
      switch (theme.id) {
        case "neon-cyber":
          return "shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)]";
        case "luxury-gold":
          return "shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]";
        case "retro-synthwave":
          return "shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)]";
        case "holographic":
          return "shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]";
        case "cosmic-dream":
          return "shadow-[0_0_25px_rgba(244,114,182,0.4)] hover:shadow-[0_0_35px_rgba(244,114,182,0.6)]";
        case "quantum-matrix":
          return "shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)]";
        case "electric-purple":
          return "shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:shadow-[0_0_35px_rgba(147,51,234,0.6)]";
        default:
          return "";
      }
    }

    if (theme.id === "artist-palette") {
      return "transform hover:scale-105";
    }

    if (theme.id === "sunset-gradient") {
      return "transform hover:scale-[1.02]";
    }

    return "";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className={`w-full px-6 py-3 font-semibold shadow-lg transition-all duration-200 ${
            theme.borderRadius ?? "rounded-xl"
          } ${buttonClasses} ${getButtonExtraClasses()}`}
        >
          <Coins className="mr-2 h-5 w-5" />
          Send Tip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Tip with {walletTypeDisplayName}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-3 text-center text-sm text-gray-400">
            Scan QR or copy address below
          </div>
          <div className="mx-auto mb-4 flex w-fit items-center justify-center rounded-lg bg-white p-2.5 shadow-md">
            <QRCodeSVG
              value={qrValue}
              size={200}
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
              className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-gray-700/20 p-1.5 transition-all hover:bg-gray-600/50"
              title="Copy address"
            >
              {copied ? <Check size={16} /> : <Clipboard size={16} />}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

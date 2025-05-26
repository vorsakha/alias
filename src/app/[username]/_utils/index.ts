import { WalletType, type Link, type Wallets } from "@prisma/client";

const getWalletDisplayName = (walletType: WalletType) => {
  switch (walletType) {
    case WalletType.LIGHTNING:
      return "⚡ LIGHTNING NETWORK";
    case WalletType.BITCOIN:
      return "₿ BITCOIN CORE";
    case WalletType.ETHEREUM:
      return "Ξ ETHEREUM CHAIN";
    case WalletType.SOLANA:
      return "◎ SOLANA PROTOCOL";
    case WalletType.DOGE:
      return "Ð DOGECOIN NET";
    case WalletType.MONERO:
      return "ⓜ MONERO SECURE";
    default:
      return "⚡ LIGHTNING NETWORK";
  }
};

const getQrValue = (wallets?: Wallets | null) => {
  if (!wallets) return "lightning:";
  switch (wallets.mainWallet) {
    case WalletType.LIGHTNING:
      return `lightning:${wallets.lightningAddress ?? ""}`;
    case WalletType.BITCOIN:
      return `bitcoin:${wallets.bitcoinAddress ?? ""}`;
    case WalletType.ETHEREUM:
      return `ethereum:${wallets.ethereumAddress ?? ""}`;
    case WalletType.SOLANA:
      return `solana:${wallets.solanaAddress ?? ""}`;
    case WalletType.DOGE:
      return `doge:${wallets.dogeAddress ?? ""}`;
    case WalletType.MONERO:
      return `monero:${wallets.moneroAddress ?? ""}`;
    default:
      return `lightning:${wallets.lightningAddress ?? ""}`;
  }
};

const getMainWalletAddress = (wallets?: Wallets | null): string | undefined => {
  if (!wallets) return undefined;
  switch (wallets.mainWallet) {
    case WalletType.LIGHTNING:
      return wallets.lightningAddress ?? undefined;
    case WalletType.BITCOIN:
      return wallets.bitcoinAddress ?? undefined;
    case WalletType.ETHEREUM:
      return wallets.ethereumAddress ?? undefined;
    case WalletType.SOLANA:
      return wallets.solanaAddress ?? undefined;
    case WalletType.DOGE:
      return wallets.dogeAddress ?? undefined;
    case WalletType.MONERO:
      return wallets.moneroAddress ?? undefined;
    default:
      return wallets.lightningAddress ?? undefined;
  }
};

const getContentTypeIndicator = (type?: string) => {
  if (!type) return null;

  if (type.startsWith("video.")) return "🎥";
  if (type.startsWith("music.")) return "🎵";
  if (type.startsWith("social.")) return "💬";
  return null;
};

const shouldUseRichPreview = (link: Link | null | undefined): boolean => {
  if (!link) {
    return false;
  }

  const { imageUrl, type } = link;

  if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
    return false;
  }

  if (typeof type !== "string" || type === "") {
    return false;
  }

  return type.startsWith("video.") || type.startsWith("music.");
};

export {
  getWalletDisplayName,
  getQrValue,
  getMainWalletAddress,
  getContentTypeIndicator,
  shouldUseRichPreview,
};

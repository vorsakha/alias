"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Clipboard, Check } from "lucide-react";
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

export default function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [copied, setCopied] = useState(false);

  const { data: creator } = api.profiles.getByUsername.useQuery({ username });

  const mainWalletAddress = creator?.wallets
    ? getMainWalletAddress(creator.wallets)
    : undefined;

  const copyToClipboard = async () => {
    if (mainWalletAddress) {
      await navigator.clipboard.writeText(mainWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-gray-700 bg-gray-800/40 p-8 backdrop-blur-sm">
      <div className="absolute inset-0 z-0 border-t border-b border-gray-700/30"></div>
      <div className="absolute inset-0 z-0 border-r border-l border-gray-700/30"></div>

      <div className="relative z-10 flex flex-col items-center">
        {creator?.avatarUrl ? (
          <div className="mb-4 h-[100px] w-[100px] overflow-hidden rounded-full border border-gray-700 shadow-lg">
            <Image
              src={creator.avatarUrl}
              alt={creator.displayName ?? username}
              width={100}
              height={100}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        ) : (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-700 bg-gray-700/30">
            <Image
              src="/assets/logo.svg"
              alt="SatSip Logo"
              width={48}
              height={48}
              className="opacity-70"
              priority
            />
          </div>
        )}
        <h1 className="flex flex-col items-center justify-center text-xl font-medium tracking-wide text-gray-100">
          {creator?.displayName ?? "ANON_USER"}
          <span className="mb-1 font-mono text-xs text-amber-400/80">
            @{username}
          </span>
        </h1>
        {creator?.bio && (
          <p className="mb-4 text-center text-sm leading-relaxed text-gray-400">
            {creator.bio}
          </p>
        )}

        {creator?.wallets && mainWalletAddress && (
          <div className="mb-6 w-full rounded-lg bg-gray-900/70 p-4 text-center">
            <div className="mb-1 text-sm font-semibold tracking-wider text-amber-400">
              {getWalletDisplayName(
                creator.wallets.mainWallet ?? WalletType.LIGHTNING,
              )}
            </div>
            <div className="mb-3 text-xs text-gray-400">Scan to send a tip</div>
            <div className="inline-block rounded-md bg-gray-800 p-3 shadow-md">
              <QRCodeSVG
                value={getQrValue(creator.wallets)}
                size={150}
                level="M"
                fgColor="#fbbf24"
                bgColor="transparent"
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
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Clipboard size={16} />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-2 flex w-full flex-col gap-3">
          {creator?.links.map((link) => {
            const useRichPreview = shouldUseRichPreview(link);
            const contentTypeIndicator = getContentTypeIndicator(
              link?.type as string,
            );

            if (useRichPreview) {
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-lg bg-gray-800/70 transition-all hover:bg-gray-700/70 focus:ring-2 focus:ring-amber-400/60 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={link.imageUrl ?? ""}
                      alt={link.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {contentTypeIndicator && (
                      <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs">
                        {contentTypeIndicator}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      {link?.icon && (
                        <div className="mt-0.5 flex-shrink-0">
                          <Image
                            src={link.icon}
                            alt="favicon"
                            width={16}
                            height={16}
                            className="rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-100">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="mb-2 line-clamp-2 text-xs text-gray-400">
                            {link.description}
                          </p>
                        )}
                        <p className="truncate text-xs text-gray-500">
                          {link.url.replace(/^https?:\/\//, "")}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              );
            } else {
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center rounded-lg bg-gray-800/70 px-4 py-4 text-gray-100 transition-colors hover:bg-gray-700/70 focus:ring-2 focus:ring-amber-400/60 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
                >
                  <div className="flex flex-shrink-0 flex-col items-center gap-2">
                    {link?.icon ? (
                      <Image
                        src={link.icon}
                        alt="favicon"
                        width={32}
                        height={32}
                        className="rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-700/50">
                        <span className="text-xs">🔗</span>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 min-w-0 flex-1">
                    <h3 className="mb-2 line-clamp-2 text-lg font-medium text-gray-100 group-hover:text-white">
                      {link.title?.length > 30
                        ? link.title.slice(0, 30) + "…"
                        : link.title}
                    </h3>
                    <p className="truncate text-xs text-gray-500">
                      {link.url.replace(/^https?:\/\//, "")}
                    </p>
                  </div>

                  {(link.siteName ?? link.author) && (
                    <div className="ml-4 flex flex-shrink-0 flex-col items-end text-right">
                      {link.siteName && (
                        <span className="text-xs font-medium text-gray-400">
                          {link.siteName}
                        </span>
                      )}
                      {link.author && (
                        <span className="text-xs text-gray-500">
                          {link.author}
                        </span>
                      )}
                    </div>
                  )}
                </a>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Instagram,
  Github,
  Facebook,
  Mail,
  Clipboard,
  Check,
  Link,
} from "lucide-react";
import { WalletType, type Wallets } from "@prisma/client";

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

const getQrValue = (wallets?: Wallets) => {
  switch (wallets?.mainWallet) {
    case WalletType.LIGHTNING:
      return `lightning:${wallets?.lightningAddress}`;
    case WalletType.BITCOIN:
      return `bitcoin:${wallets?.bitcoinAddress}`;
    case WalletType.ETHEREUM:
      return `ethereum:${wallets?.ethereumAddress}`;
    case WalletType.SOLANA:
      return `solana:${wallets?.solanaAddress}`;
    case WalletType.DOGE:
      return `doge:${wallets?.dogeAddress}`;
    case WalletType.MONERO:
      return `monero:${wallets?.moneroAddress}`;
    default:
      return `lightning:${wallets?.lightningAddress}`;
  }
};

export default function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [copied, setCopied] = useState(false);

  const { data: creator } = api.profiles.getByUsername.useQuery({ username });

  const copyToClipboard = async () => {
    if (creator?.wallets?.lightningAddress) {
      await navigator.clipboard.writeText(creator.wallets.lightningAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-gray-700 bg-gray-800/40 p-8 backdrop-blur-sm">
      <div className="absolute inset-0 z-0 border-t border-b border-gray-700/30"></div>
      <div className="absolute inset-0 z-0 border-r border-l border-gray-700/30"></div>

      <div className="relative z-10 flex flex-col items-center">
        {creator?.avatarUrl ? (
          <div className="mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-gray-700 shadow-lg">
            <Image
              src={creator.avatarUrl}
              alt={creator.displayName}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-700">
            <Image
              src="/assets/logo.svg"
              alt="SatSip Logo"
              width={64}
              height={64}
              className="h-auto w-full opacity-70"
              priority
            />
          </div>
        )}
        <h1 className="flex flex-col items-center justify-center text-xl font-medium tracking-wide text-gray-100">
          {creator?.displayName ?? "ANON_USER"}
          <span className="mb-3 font-mono text-xs text-amber-400/80">
            @{username}
          </span>
        </h1>
        {creator?.bio && (
          <div className="mb-6 text-center text-xs leading-relaxed text-gray-400">
            {creator.bio}
          </div>
        )}
        {creator?.wallets?.lightningAddress && (
          <div className="w-full rounded-lg bg-gray-900/70 p-4 text-center">
            <div className="mb-2 text-xs tracking-widest text-amber-400/80 uppercase">
              {getWalletDisplayName(
                creator?.wallets?.mainWallet ?? WalletType.LIGHTNING,
              )}
            </div>
            <div className="font-mono text-xs text-amber-400/80">
              ┌─ SCAN TO TIP ─┐
            </div>
            <div className="inline-block rounded-md bg-gray-800 p-3">
              <QRCodeSVG
                value={getQrValue(creator?.wallets)}
                size={150}
                level="M"
                fgColor="#fbbf24" // amber-400
                bgColor="transparent"
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <p className="font-mono text-xs text-gray-400">
                {creator?.wallets?.lightningAddress}
              </p>
              <button
                onClick={copyToClipboard}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-gray-800 p-1 text-gray-300 transition-all hover:bg-gray-700"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Clipboard size={14} />
                )}
              </button>
            </div>
          </div>
        )}
        <div className="mt-6 flex w-full justify-center space-x-4">
          {creator?.socials?.xUsername && (
            <a
              href={`https://x.com/${creator.socials.xUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full p-1 text-gray-400 transition hover:text-amber-400"
              title="X / Twitter"
            >
              <X size={16} />
            </a>
          )}
          {creator?.websiteUrl && (
            <a
              href={creator.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full p-1 text-gray-400 transition hover:text-amber-400"
              title="Website Url"
            >
              <Link size={16} />
            </a>
          )}
          {creator?.socials?.instagramUsername && (
            <a
              href={`https://instagram.com/${creator.socials.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full p-1 text-gray-400 transition hover:text-amber-400"
              title="Instagram"
            >
              <Instagram size={16} />
            </a>
          )}
          {creator?.socials?.githubUsername && (
            <a
              href={`https://github.com/${creator.socials.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full p-1 text-gray-400 transition hover:text-amber-400"
              title="GitHub"
            >
              <Github size={16} />
            </a>
          )}
          {creator?.socials?.facebookUsername && (
            <a
              href={`https://facebook.com/${creator.socials.facebookUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full p-1 text-gray-400 transition hover:text-amber-400"
              title="Facebook"
            >
              <Facebook size={16} />
            </a>
          )}
          {creator?.socials?.email && (
            <a
              href={`mailto:${creator.socials.email}`}
              className="flex items-center justify-center rounded-full p-1 text-gray-400 transition hover:text-amber-400"
              title="Email"
            >
              <Mail size={16} />
            </a>
          )}
          {creator?.socials?.nostrPubkey && (
            <a
              href={`nostr:${creator.socials.nostrPubkey}`}
              className="flex items-center justify-center rounded-full p-1 text-gray-400 transition hover:text-amber-400"
              title="Nostr"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 256 256"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M210.8 199.4c0 3.1-2.5 5.7-5.7 5.7h-68c-3.1 0-5.7-2.5-5.7-5.7v-15.5c.3-19 2.3-37.2 6.5-45.5 2.5-5 6.7-7.7 11.5-9.1 9.1-2.7 24.9-.9 31.7-1.2 0 0 20.4.8 20.4-10.7s-9.1-8.6-9.1-8.6c-10 .3-17.7-.4-22.6-2.4-8.3-3.3-8.6-9.2-8.6-11.2-.4-23.1-34.5-25.9-64.5-20.1-32.8 6.2.4 53.3.4 116.1v8.4c0 3.1-2.6 5.6-5.7 5.6H57.7c-3.1 0-5.7-2.5-5.7-5.7v-144c0-3.1 2.5-5.7 5.7-5.7h31.7c3.1 0 5.7 2.5 5.7 5.7 0 4.7 5.2 7.2 9 4.5 11.4-8.2 26-12.5 42.4-12.5 36.6 0 64.4 21.4 64.4 68.7v83.2ZM150 99.3c0-6.7-5.4-12.1-12.1-12.1s-12.1 5.4-12.1 12.1 5.4 12.1 12.1 12.1S150 106 150 99.3Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          )}
        </div>
        <div className="mt-6 text-center">
          <Image
            src="/assets/logo.svg"
            alt="SatSip Logo"
            width={35}
            height={35}
            className="mx-auto"
            priority
          />
          <p className="text-xs text-gray-500">
            caffeine level: {Math.floor(Math.random() * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}

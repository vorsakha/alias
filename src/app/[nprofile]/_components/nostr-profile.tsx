"use client";

import { Frown, Copy, BadgeCheck } from "lucide-react";
import { useNostr } from "@/lib/nostr/nprofile-provider";
import {
  useProfileAndLinks,
  useCreateZapRequest,
  useSendZap,
} from "@/lib/nostr/query-hooks";
import {
  getThemeConfig,
  applyThemeClasses,
  type ThemeConfig,
} from "@/app/_constants/theme";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ZapDialog } from "@/components/zap-dialog";
import { toast } from "sonner";
import { encodeNpub } from "@/lib/nostr/bech32";
import type { LinkData } from "@/lib/nostr/events";
import { useEffect, useRef, useState } from "react";

const defaultThemeId = "minimal-dark";

interface NostrProfileProps {
  nprofile: string;
}

export function NostrProfile({ nprofile }: NostrProfileProps) {
  const { reconnect, connectToNProfile, nprofileData, isConnected } =
    useNostr();
  const [npub, setNpub] = useState<string>("");
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);

  const createZapRequestMutation = useCreateZapRequest();
  const sendZapMutation = useSendZap();

  const didConnectRef = useRef<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (nprofile && didConnectRef.current !== nprofile) {
      didConnectRef.current = nprofile;
      setConnectionRetryCount(0);
      void connectToNProfile(nprofile);
    }
  }, [nprofile, connectToNProfile]);

  useEffect(() => {
    if (!isConnected && nprofile && connectionRetryCount < 3) {
      const timeout = setTimeout(
        () => {
          if (!isConnected) {
            console.log(
              `Retrying connection (attempt ${connectionRetryCount + 1})`,
            );
            setConnectionRetryCount((prev) => prev + 1);
            void connectToNProfile(nprofile);
          }
        },
        5000 + connectionRetryCount * 2000,
      ); // Increasing delay: 5s, 7s, 9s

      retryTimeoutRef.current = timeout;
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isConnected, nprofile, connectToNProfile, connectionRetryCount]);

  useEffect(() => {
    if (nprofileData) {
      try {
        const generatedNpub = encodeNpub(nprofileData.pubkey);
        setNpub(generatedNpub);
      } catch (error) {
        console.error("Failed to generate npub:", error);
      }
    }
  }, [nprofileData]);

  const {
    profile,
    links,
    isLoading: dataLoading,
    error: dataError,
  } = useProfileAndLinks(nprofileData?.pubkey ?? "");

  const { theme } = useTheme();

  const handleZap = async (
    amount: number,
    lightningAddress: string,
    recipientPubkey: string,
  ) => {
    try {
      const loadingToast = toast.loading("Creating zap request...");

      const zapRequest = await createZapRequestMutation.mutateAsync({
        amount: amount * 1000, // Convert sats to millisats
        recipientPubkey,
        content: "Zap!",
        relays: ["wss://nostr-pub.wellorder.net", "wss://relay.damus.io"],
      });

      const success = await sendZapMutation.mutateAsync({
        lightningAddress,
        amount,
        zapRequest,
      });

      toast.dismiss(loadingToast);

      if (success) {
        toast.success(
          `Zap of ${amount} sats initiated! Check your Lightning wallet to complete payment.`,
        );
      } else {
        toast.error("Failed to initiate zap");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to initiate zap");
      }
      throw error;
    }
  };

  if (!theme) {
    const fallbackTheme = getThemeConfig(defaultThemeId);
    if (!fallbackTheme) {
      throw new Error("Default theme not found");
    }
    return <ProfileSkeleton theme={fallbackTheme} />;
  }

  const hasConnectionError =
    dataError instanceof Error
      ? dataError.message.includes("Not connected")
      : false;
  const isConnectionTimeout = dataLoading && !nprofileData;

  if (dataLoading || isConnectionTimeout) {
    return <ProfileSkeleton theme={theme} />;
  }

  if (hasConnectionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <PageContainer theme={theme}>
          <div className="text-center">
            <Frown className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <h1
              className={`mb-2 text-2xl ${theme?.headingFont ?? "font-bold"} ${theme?.textColor ?? "text-white"}`}
            >
              Connection Error
            </h1>
            <p className={`${theme?.mutedColor ?? "text-gray-400"}`}>
              Unable to connect to the Nostr network. Please check your internet
              connection and try again.
            </p>
            {connectionRetryCount > 0 && (
              <p
                className={`mt-2 text-sm ${theme?.mutedColor ?? "text-gray-400"}`}
              >
                Retry attempts: {connectionRetryCount}/3
              </p>
            )}
            <Button
              onClick={async () => {
                try {
                  setConnectionRetryCount(0);
                  await reconnect();
                  toast.success("Connection restored!");
                } catch {
                  toast.error("Failed to reconnect. Please try again.");
                }
              }}
              className="mt-4"
              variant="outline"
            >
              Retry Connection
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (dataError || (!profile && !dataLoading)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <PageContainer theme={theme}>
          <div className="text-center">
            <Frown className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <h1
              className={`mb-2 text-2xl ${theme?.headingFont ?? "font-bold"} ${theme?.textColor ?? "text-white"}`}
            >
              Profile Not Found
            </h1>
            <p className={`${theme?.mutedColor ?? "text-gray-400"}`}>
              The requested profile could not be found on the Nostr network.
            </p>
            {dataError && (
              <p className="mt-2 text-sm text-red-400">
                {dataError instanceof Error
                  ? dataError.message
                  : String(dataError)}
              </p>
            )}
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <PageContainer theme={theme}>
        {profile && (
          <UserProfileHeader profile={profile} npub={npub} theme={theme} />
        )}

        {profile?.lud16 && nprofileData && (
          <div className="mb-6 w-full">
            <ZapDialog
              lightningAddress={profile.lud16}
              recipientPubkey={nprofileData.pubkey}
              theme={theme}
              onZap={handleZap}
            />
          </div>
        )}

        {links && links.length > 0 ? (
          <div className="mt-4 flex w-full flex-col gap-4">
            {links.map((link) => (
              <LinkItem key={link.id} link={link} theme={theme} />
            ))}
          </div>
        ) : (
          <div
            className={`mt-6 rounded-xl border border-dashed p-8 text-center ${theme.borderColor} ${theme.cardBg}/30`}
          >
            <Frown className={`mx-auto mb-3 h-10 w-10 ${theme.mutedColor}`} />
            <p className={theme.mutedColor}>
              This bitcoiner hasn&apos;t added any links yet.
            </p>
            <p className={`text-xs ${theme.mutedColor}/70`}>
              Check back later!
            </p>
          </div>
        )}
      </PageContainer>

      <footer className="relative z-20 mt-4 flex items-center justify-center">
        <p className={`text-sm ${theme?.mutedColor ?? "text-gray-400"}`}>
          <a
            href="https://sat.sip"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Join {profile?.display_name ?? profile?.name ?? "this bitcoiner"} on{" "}
            <span
              className={`font-bold ${theme?.headingColor ?? "text-white"}`}
            >
              Nostr Links
            </span>
          </a>
        </p>
      </footer>
    </div>
  );
}

function ProfileSkeleton({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <PageContainer theme={theme}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-24 w-24 animate-pulse rounded-full bg-gray-700" />
          <div className="mb-2 h-8 animate-pulse rounded bg-gray-700" />
          <div className="h-4 animate-pulse rounded bg-gray-700" />
          <div className="mt-2 h-4 animate-pulse rounded bg-gray-700" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-16 animate-pulse rounded-lg ${theme?.cardBg ?? "bg-gray-800"}`}
            />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}

function LinkItem({ link, theme }: { link: LinkData; theme: ThemeConfig }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const linkClasses = applyThemeClasses(theme, "links");
  const textColor = theme.textColor;
  const mutedColor = theme.mutedColor;
  const accentColor = theme.accentColor;

  const useRichPreview = link.imageUrl ?? link.image_url;

  if (link.type === "wallet") {
    return (
      <div className="group relative">
        <div
          className={`flex items-center gap-4 border p-4 shadow-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none ${linkClasses}`}
        >
          <div className="flex-1">
            <h3 className={`line-clamp-1 text-base font-semibold ${textColor}`}>
              {link.title}
            </h3>
            <p
              className={`font-mono text-sm ${accentColor}/80 group-hover:${accentColor}`}
            >
              {link.url}
            </p>
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className={`${theme.customClasses?.button ?? "border-gray-600 text-gray-300 hover:bg-gray-700"}`}
          >
            Copy
          </Button>
        </div>
      </div>
    );
  }

  if (useRichPreview && (link.imageUrl ?? link.image_url)) {
    return (
      <div className="group relative">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group block overflow-hidden border shadow-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none ${linkClasses}`}
        >
          <div className="relative h-44 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={link.imageUrl ?? link.image_url}
              alt={link.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-50"></div>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              {link.icon && (
                <div className="mt-0.5 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={link.icon}
                    alt={link.title}
                    width={20}
                    height={20}
                    className="rounded-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3
                  className={`mb-0.5 line-clamp-2 text-base font-semibold ${textColor}`}
                >
                  {link.title}
                </h3>
                {link.description && (
                  <p className={`mb-1.5 line-clamp-2 text-xs ${mutedColor}`}>
                    {link.description}
                  </p>
                )}
                <p
                  className={`truncate text-xs ${accentColor}/80 group-hover:${accentColor}`}
                >
                  {link.url.replace(/^https?:\/\//, "")}
                </p>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  // Standard link preview
  return (
    <div className="group relative">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-center gap-4 border p-4 shadow-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none ${linkClasses}`}
      >
        <div className="flex-shrink-0">
          {link.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={link.icon}
              alt={link.title}
              width={28}
              height={28}
              className="rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700/60">
              <span className="text-gray-400">🔗</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`line-clamp-1 text-base font-semibold ${textColor}`}>
            {link.title}
          </h3>
          <p
            className={`truncate text-xs ${accentColor}/80 group-hover:${accentColor}`}
          >
            {link.url.replace(/^https?:\/\//, "")}
          </p>
        </div>
        {(link.siteName ?? link.author) && (
          <div className="mt-2 ml-2 hidden flex-shrink-0 flex-col items-end text-right sm:flex">
            {link.siteName && (
              <span className={`text-xs font-medium ${mutedColor}`}>
                {link.siteName}
              </span>
            )}
            {link.author && (
              <span className={`text-xs ${mutedColor}`}>{link.author}</span>
            )}
          </div>
        )}
      </a>
    </div>
  );
}

function PageContainer({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ThemeConfig;
}) {
  const containerClasses = applyThemeClasses(theme, "container");

  return (
    <div
      className={`relative mx-auto my-8 w-full overflow-hidden border md:min-w-[350px] ${theme.containerMaxWidth} ${containerClasses} sm:p-8`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function UserProfileHeader({
  profile,
  npub,
  theme,
}: {
  profile: {
    picture?: string;
    display_name?: string;
    name?: string;
    about?: string;
    nip05?: string;
  };
  npub: string;
  theme: ThemeConfig;
}) {
  const headerClasses = applyThemeClasses(theme, "header");
  const avatarClasses = applyThemeClasses(theme, "avatar");
  const buttonClasses = applyThemeClasses(theme, "button");

  const handleCopyNpub = async () => {
    try {
      await navigator.clipboard.writeText(npub);
      toast.success("Npub copied to clipboard!");
    } catch {
      toast.error("Failed to copy npub");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-5">
        {profile.picture ? (
          <div
            className={`h-[100px] w-[100px] overflow-hidden rounded-full shadow-xl ring-2 ring-offset-4 ${avatarClasses} ${theme.shadow}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.picture}
              alt={profile.display_name ?? profile.name ?? "Profile"}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex h-[100px] w-[100px] items-center justify-center rounded-full text-4xl shadow-lg ring-2 ring-offset-4 ${theme.cardBg} ${theme.textColor} ${avatarClasses} ${theme.shadow}`}
          >
            <span>
              {(profile.display_name ?? profile.name ?? "A")[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        <h1
          className={`text-center text-2xl font-bold tracking-tight ${headerClasses} ${theme.headingFont}`}
        >
          {profile.display_name ?? profile.name ?? "Anonymous"}
        </h1>
        {profile.nip05 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <BadgeCheck className={`${theme.accentColor} h-5 w-5`} />
              </div>
            </TooltipTrigger>
            <TooltipContent
              className={`${theme.background} ${theme.textColor} border ${theme.borderColor} ${theme.shadow}`}
            >
              <p>NIP-05 Verified</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {profile.nip05 && (
        <div className="mb-3 flex items-center justify-center">
          <span
            className={`text-xs ${theme.fontFamily.includes("mono") ? "font-mono" : ""} ${theme.accentColor}`}
          >
            {profile.nip05}
          </span>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <span
          className={`text-sm ${theme.fontFamily.includes("mono") ? "font-mono" : ""} ${theme.accentColor}`}
        >
          {npub ? `${npub.slice(0, 8)}...${npub.slice(-8)}` : "Loading..."}
        </span>
        <Button
          onClick={handleCopyNpub}
          size="sm"
          className={`${buttonClasses} h-6 w-6 p-2`}
          disabled={!npub}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      {profile.about && (
        <p
          className={`mb-6 max-w-md text-center text-sm leading-relaxed ${theme.textColor}`}
        >
          {profile.about}
        </p>
      )}
    </div>
  );
}

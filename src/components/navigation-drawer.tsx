"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNostr } from "@/lib/nostr/nprofile-provider";
import { useProfile } from "@/lib/nostr/query-hooks";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { encodeNProfile } from "@/lib/nostr/bech32";
import { useEffect, useState } from "react";
import { Menu, User, Settings, LogOut, Home, ExternalLink } from "lucide-react";

export function NavigationDrawer() {
  const { isConnected, ndk, disconnect } = useNostr();
  const router = useRouter();
  const [userNProfile, setUserNProfile] = useState<string>("");

  const userPubkey = ndk?.activeUser?.pubkey;
  const userNpub = ndk?.activeUser?.npub;

  const { data: profile, isLoading: profileLoading } = useProfile(
    userPubkey ?? "",
  );

  const safeProfile =
    profile && typeof profile === "object" && "name" in profile
      ? profile
      : null;

  useEffect(() => {
    if (userPubkey) {
      try {
        const nprofile = encodeNProfile(userPubkey, []);
        setUserNProfile(nprofile);
      } catch (error) {
        console.error("Failed to generate nprofile:", error);
      }
    }
  }, [userPubkey]);

  if (!isConnected) {
    return null;
  }

  const handleDisconnect = async () => {
    await disconnect();
    router.push("/");
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-white/20 bg-black/40 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-black/60 hover:shadow-xl"
          >
            <Menu className="h-5 w-5 text-white" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full w-80 border-l border-white/10 bg-black/95 backdrop-blur-xl">
          <DrawerHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-xl font-bold text-white">
                  Nostr Links
                </DrawerTitle>
                <DrawerDescription className="text-gray-400">
                  Your decentralized profile
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-6 px-6 py-4">
            <div className="flex items-center space-x-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={safeProfile?.picture}
                  alt={safeProfile?.display_name ?? safeProfile?.name ?? "User"}
                />
                <AvatarFallback className="bg-purple-600 text-white">
                  {(safeProfile?.display_name ?? safeProfile?.name)
                    ?.charAt(0)
                    ?.toUpperCase() ??
                    userNpub?.slice(5, 6)?.toUpperCase() ??
                    "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {profileLoading
                    ? "Loading..."
                    : (safeProfile?.display_name ??
                      safeProfile?.name ??
                      "Anonymous")}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {userNpub ? `${userNpub.slice(0, 16)}...` : "Connected"}
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Home className="mr-3 h-5 w-5" />
                  Home
                </Button>
              </Link>

              {userNProfile && (
                <Link href={`/${userNProfile}`}>
                  <Button
                    variant="ghost"
                    className="h-12 w-full justify-start text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <User className="mr-3 h-5 w-5" />
                    My Profile
                    <ExternalLink className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </Link>
              )}

              <Link href="/profile/settings">
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Button>
              </Link>
            </nav>

            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-400">
                  Connected to Nostr
                </span>
              </div>
            </div>
          </div>

          <DrawerFooter className="p-6 pt-4">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="h-12 w-full border-red-500/30 text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

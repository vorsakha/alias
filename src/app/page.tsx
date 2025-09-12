"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NostrStatus } from "@/components/nostr-status";
import { Button } from "@/components/ui/button";
import { useNostr } from "@/lib/nostr/nprofile-provider";

export default function Home() {
  const { isConnected, hasSigner, ndk } = useNostr();
  const router = useRouter();

  const nprofile = ndk?.activeUser?.nprofile;

  const handleGetStarted = () => {
    if (isConnected && hasSigner && nprofile) {
      router.push("/profile/settings");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
              <h1 className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl lg:text-8xl">
                Nostr Links
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-gray-400 sm:text-2xl">
                Now powered by{" "}
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Nostr
                </span>{" "}
                - Decentralized profiles
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-8">
              <NostrStatus />

              {isConnected && hasSigner ? (
                <div className="space-y-4">
                  <div className="font-semibold text-green-400">
                    ✅ Connected to Nostr!
                  </div>

                  <div className="flex flex-row items-center gap-4">
                    <Button
                      onClick={handleGetStarted}
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Set Up Your Profile
                    </Button>
                    {nprofile && (
                      <Link
                        href={`/${nprofile}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors duration-200 hover:text-purple-400"
                        target="_blank"
                      >
                        <span>👀</span>
                        <span>View Your Profile</span>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-w-md text-sm text-gray-400">
                    Connect with a Nostr browser extension to get started with
                    your decentralized profile.
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isConnected && (
            <div className="mx-auto mt-24 max-w-4xl">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm">
                <div className="space-y-6 text-center">
                  <h3 className="text-2xl font-semibold text-white">
                    Decentralized Profiles
                  </h3>
                  <p className="leading-relaxed text-gray-400">
                    Nostr Links provides a decentralized platform for bitcoiners
                    to build their online presence. Your profile data is stored
                    on the Nostr network, ensuring true ownership and
                    portability across the decentralized web.
                  </p>
                  <div className="mt-8 grid grid-cols-1 gap-6 text-left md:grid-cols-3">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-purple-400">
                        Decentralized Storage
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Data stored on Nostr relays</li>
                        <li>• No centralized databases</li>
                        <li>• Censorship-resistant platform</li>
                        <li>• Global network redundancy</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-orange-400">
                        Bitcoin Features
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Custom profile customization</li>
                        <li>• Lightning zap integration</li>
                        <li>• Social media link management</li>
                        <li>• Real-time updates</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-400">
                        Open Standards
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• NIP-05 identifier support</li>
                        <li>• Interoperable with Nostr clients</li>
                        <li>• Open source protocol</li>
                        <li>• Community-driven development</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isConnected && hasSigner && (
            <div className="mx-auto mt-24 max-w-4xl">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm">
                <div className="space-y-6 text-center">
                  <h3 className="text-2xl font-semibold text-white">
                    Welcome to Nostr Links
                  </h3>
                  <p className="leading-relaxed text-gray-400">
                    You&apos;re now connected to the decentralized web.
                    Configure your profile to start sharing your content and
                    receiving Lightning payments.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-purple-400">
                          Profile Configuration
                        </h4>
                        <p className="text-sm text-gray-400">
                          Set up your display name, bio, and profile picture
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-orange-400">
                          Lightning Integration
                        </h4>
                        <p className="text-sm text-gray-400">
                          Connect Lightning wallets and receive instant Bitcoin
                          payments
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-400">
                          Content Management
                        </h4>
                        <p className="text-sm text-gray-400">
                          Showcase your content, social media, and projects
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

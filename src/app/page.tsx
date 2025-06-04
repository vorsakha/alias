import Link from "next/link";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { db } from "@/server/db";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  let hasCreatorProfile = false;

  if (session?.user) {
    const creator = await db.creator.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    hasCreatorProfile = !!creator;
  }

  return (
    <HydrateClient>
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
          <div className="container mx-auto px-6 py-24 text-center">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="space-y-4">
                <h1 className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl lg:text-8xl">
                  SatSip
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-gray-400 sm:text-2xl">
                  Create your Links profile and receive{" "}
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    crypto tips
                  </span>{" "}
                  effortlessly
                </p>
              </div>

              {session && (
                <div className="flex flex-col items-center gap-4 pt-8">
                  {hasCreatorProfile ? (
                    <Link href="/creator/settings">
                      <Button
                        size="lg"
                        className="group relative h-12 overflow-hidden rounded-full bg-white px-8 text-base font-semibold text-black transition-all duration-300 hover:bg-gray-100 hover:shadow-2xl hover:shadow-white/20"
                      >
                        <span className="relative z-10">
                          Manage Your Profile
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/onboarding">
                      <Button
                        size="lg"
                        className="group relative h-12 overflow-hidden rounded-full bg-white px-8 text-base font-semibold text-black transition-all duration-300 hover:bg-gray-100 hover:shadow-2xl hover:shadow-white/20"
                      >
                        <span className="relative z-10">Complete Setup</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              <Link
                href={hasCreatorProfile ? "/creator/settings" : "/onboarding"}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className="relative z-10 text-left">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    Creator Profile
                  </h3>
                  <p className="leading-relaxed text-gray-400">
                    {hasCreatorProfile
                      ? "Manage your creator profile and customize your page to reflect your brand."
                      : "Create your creator profile to start receiving Bitcoin tips from your audience."}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-purple-400 transition-colors duration-300 group-hover:text-purple-300">
                    {hasCreatorProfile ? "Manage profile" : "Get started"}
                    <svg
                      className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>

              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:shadow-2xl hover:shadow-orange-500/10"
              >
                <div className="relative z-10 text-left">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                    {session ? (
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {session ? "Sign Out" : "Sign In"}
                  </h3>
                  <p className="leading-relaxed text-gray-400">
                    {session
                      ? `Currently signed in as ${session.user?.name ?? "User"}. Sign out when you're done.`
                      : "Sign in to create or manage your creator profile and start receiving tips."}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-orange-400 transition-colors duration-300 group-hover:text-orange-300">
                    {session ? "Sign out" : "Get started"}
                    <svg
                      className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}

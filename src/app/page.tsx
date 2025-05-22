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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            SatSip
          </h1>
          <p className="text-center text-2xl">
            Create your Lightning payment profile and receive Bitcoin tips
            easily
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href={hasCreatorProfile ? "/creator/settings" : "/onboarding"}
            >
              <h3 className="text-2xl font-bold">Creator Profile →</h3>
              <div className="text-lg">
                {hasCreatorProfile
                  ? "Manage your creator profile and customize your page."
                  : "Create your creator profile to start receiving Bitcoin tips."}
              </div>
            </Link>

            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
            >
              <h3 className="text-2xl font-bold">
                {session ? "Sign Out →" : "Sign In →"}
              </h3>
              <div className="text-lg">
                {session
                  ? `Currently signed in as ${session.user?.name ?? "User"}`
                  : "Sign in to create or manage your creator profile."}
              </div>
            </Link>
          </div>

          {session && hasCreatorProfile && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <Link href="/creator/settings">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Manage Your Profile
                </Button>
              </Link>
            </div>
          )}

          {session && !hasCreatorProfile && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <Link href="/onboarding">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Complete Your Profile Setup
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}

import { Suspense } from "react";
import { NostrProfile } from "./_components/nostr-profile";
import { getServerProfileFromNProfile } from "@/lib/nostr/server-queries";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ nprofile: string }>;
}

export const revalidate = 3600; // 1 hour in seconds
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { nprofile } = await params;

  try {
    const profile = await getServerProfileFromNProfile(nprofile);

    if (!profile) {
      return {
        title: "Profile - Nostr Links",
        description: "Check out this profile on Nostr Links",
      };
    }

    const displayName = profile.display_name ?? profile.name ?? "Anonymous";
    const title = `${displayName} - Nostr Links`;

    const description =
      profile.about ?? `Check out ${displayName}'s profile on Nostr Links`;

    return {
      title,

      description,
      openGraph: {
        title,

        description,
        type: "profile",

        images: profile.picture ? [profile.picture] : [],
      },
      twitter: {
        card: "summary",

        title,

        description,

        images: profile.picture ? [profile.picture] : [],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata for nprofile:", error);
    return {
      title: "Profile - Nostr Links",
      description: "Check out this profile on Nostr Links",
    };
  }
}

export default function ProfilePage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent params={params} />
    </Suspense>
  );
}

async function ProfileContent({ params }: PageProps) {
  const { nprofile } = await params;

  return <NostrProfile nprofile={nprofile} />;
}

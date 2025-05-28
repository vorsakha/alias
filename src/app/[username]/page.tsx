import { Frown } from "lucide-react";
import { UserProfileHeader } from "./_components/profile-header";
import { TippingButton } from "./_components/profile-tipping-button";
import { LinkItem } from "./_components/profile-item";
import { PageContainer } from "./_components/profile-container";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getThemeConfig } from "@/app/_constants/theme";

// Default theme
const defaultThemeId = "minimal-dark"; // TODO: unsafe change later

export const revalidate = 3600; // 1 hour in seconds
export const dynamicParams = true;

export async function generateStaticParams() {
  const creators = await db.creator.findMany({
    select: {
      username: true,
    },
  });

  return creators.map((creator) => ({
    username: creator.username,
  }));
}

async function getCreatorByUsername(username: string) {
  const creator = await db.creator.findUnique({
    where: { username },
    include: {
      wallets: true,
      links: {
        where: {
          isActive: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  return creator;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    return {
      title: "Creator Not Found",
      description: "The requested creator profile could not be found.",
    };
  }

  const title = `${creator.displayName ?? creator.username} - SatSip`;
  const description =
    creator.bio ??
    `Check out ${creator.displayName ?? creator.username}'s profile on SatSip`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: creator.avatarUrl ? [creator.avatarUrl] : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: creator.avatarUrl ? [creator.avatarUrl] : [],
    },
  };
}

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    notFound();
  }

  const themeId = creator.theme ?? defaultThemeId;
  const theme = getThemeConfig(themeId);

  if (!theme) {
    const defaultTheme = getThemeConfig(defaultThemeId);
    if (!defaultTheme) {
      throw new Error("Default theme not found");
    }
    return (
      <PageContainer theme={defaultTheme}>
        <UserProfileHeader
          creator={creator}
          username={username}
          theme={defaultTheme}
        />
        {creator?.wallets?.mainWallet && (
          <TippingButton wallets={creator.wallets} theme={defaultTheme} />
        )}
        {creator.links.length > 0 ? (
          <div className="mt-2 flex w-full flex-col gap-4">
            {creator.links.map((link) => (
              <LinkItem key={link.id} link={link} theme={defaultTheme} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-gray-700 bg-gray-800/30 p-8 text-center">
            <Frown className="mx-auto mb-3 h-10 w-10 text-gray-600" />
            <p className="text-gray-400">
              This creator hasn&apos;t added any links yet.
            </p>
            <p className="text-xs text-gray-500">Check back later!</p>
          </div>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer theme={theme}>
      <UserProfileHeader creator={creator} username={username} theme={theme} />

      {creator?.wallets?.mainWallet && (
        <TippingButton wallets={creator.wallets} theme={theme} />
      )}

      {creator.links.length > 0 ? (
        <div className="mt-2 flex w-full flex-col gap-4">
          {creator.links.map((link) => (
            <LinkItem key={link.id} link={link} theme={theme} />
          ))}
        </div>
      ) : (
        <div
          className={`mt-6 rounded-xl border border-dashed p-8 text-center ${theme.borderColor} ${theme.cardBg}/30`}
        >
          <Frown className={`mx-auto mb-3 h-10 w-10 ${theme.mutedColor}`} />
          <p className={theme.mutedColor}>
            This creator hasn&apos;t added any links yet.
          </p>
          <p className={`text-xs ${theme.mutedColor}/70`}>Check back later!</p>
        </div>
      )}
    </PageContainer>
  );
}

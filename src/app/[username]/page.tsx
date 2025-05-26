"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";

import { Frown } from "lucide-react";
import { UserProfileHeader } from "./_components/profile-header";
import { WalletDisplay } from "./_components/profile-wallet";
import { LinkItem } from "./_components/profile-item";
import { PageContainer } from "./_components/profile-container";

export default function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: creator } = api.profiles.getByUsername.useQuery({ username });

  if (!creator) {
    return null;
  }

  return (
    <PageContainer>
      <UserProfileHeader creator={creator} username={username} />

      {creator.wallets && <WalletDisplay wallets={creator.wallets} />}

      {creator.links.length > 0 ? (
        <div className="mt-2 flex w-full flex-col gap-4">
          {" "}
          {creator.links.map((link) => (
            <LinkItem key={link.id} link={link} />
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

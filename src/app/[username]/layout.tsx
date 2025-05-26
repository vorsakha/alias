"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageContainer } from "./_components/profile-container";
import { CreatorProfileError } from "./_components/profile-error";
import { CreatorProfileSkeleton } from "./_components/profile-skeleton";

// Default dark theme
const defaultTheme = "bg-gray-900";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const { username } = useParams<{ username: string }>();
  const {
    data: creator,
    isLoading,
    isError,
    error,
  } = api.profiles.getByUsername.useQuery({ username });

  if (isLoading) {
    return (
      <PageContainer>
        <CreatorProfileSkeleton />
      </PageContainer>
    );
  }

  if (isError || !creator) {
    return (
      <PageContainer>
        <CreatorProfileError
          message={error?.message ?? "Creator not found or failed to load."}
        />
      </PageContainer>
    );
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center ${
        creator?.theme ?? defaultTheme
      } p-4 font-sans`}
    >
      <div className="absolute top-4 left-4 mb-4 w-16">
        <Link href="/">
          <Image
            src="/assets/logo.svg"
            alt="SatSip Logo"
            width={64}
            height={64}
            className="h-auto w-full opacity-40 transition-opacity duration-300 hover:opacity-100"
            priority
          />
        </Link>
      </div>
      {children}
      <footer className="mt-4 flex items-center justify-center">
        <p className="text-sm text-gray-400">
          <Link
            href="https://sat.sip"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Join {creator?.displayName ?? username} on{" "}
            <span className="font-bold text-white">SatSip</span> &mdash; Sip,
            Tip, Connect.
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default ProfileLayout;

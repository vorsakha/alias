"use client";

import { api } from "@/trpc/react";
import { Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// Default dark theme
const defaultTheme = "bg-gray-900";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const { username } = useParams<{ username: string }>();
  const {
    data: creator,
    isLoading,
    error,
  } = api.profiles.getByUsername.useQuery({ username });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 p-4">
        <h1 className="text-xl font-medium text-amber-400">
          {error ? "Error loading profile" : "Creator not found"}
        </h1>
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center ${
        creator.theme ?? defaultTheme
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
      <footer className="flex items-center justify-center">
        <p className="absolute bottom-4 text-sm text-gray-400">
          Brewed with <Zap color="#fbbf24" className="inline-block" /> by SatSip
        </p>
      </footer>
    </div>
  );
};

export default ProfileLayout;

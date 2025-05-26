import type { Creator } from "@prisma/client";
import Image from "next/image";

interface UserProfileHeaderProps {
  creator: Pick<Creator, "avatarUrl" | "displayName" | "bio">;
  username: string;
}

export function UserProfileHeader({
  creator,
  username,
}: UserProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-5">
        {creator.avatarUrl ? (
          <div className="h-[100px] w-[100px] overflow-hidden rounded-full shadow-xl ring-2 ring-gray-700 ring-offset-4 ring-offset-gray-800/60">
            <Image
              src={creator.avatarUrl}
              alt={creator.displayName ?? username}
              width={100}
              height={100}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        ) : (
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gray-700/50 text-4xl text-gray-400 shadow-lg ring-2 ring-gray-600 ring-offset-4 ring-offset-gray-800/60">
            <span>{username?.[0]?.toUpperCase() ?? "A"}</span>
          </div>
        )}
      </div>

      <h1 className="text-center text-2xl font-bold tracking-tight text-gray-50">
        {creator.displayName ?? "ANON_USER"}
      </h1>
      <span className="mb-3 font-mono text-sm text-amber-400">@{username}</span>

      {creator.bio && (
        <p className="mb-6 max-w-md text-center text-sm leading-relaxed text-gray-300">
          {creator.bio}
        </p>
      )}
    </div>
  );
}

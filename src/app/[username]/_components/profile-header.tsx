import type { Creator } from "@prisma/client";
import Image from "next/image";
import { applyThemeClasses, type ThemeConfig } from "@/app/_constants/theme";

interface UserProfileHeaderProps {
  creator: Pick<Creator, "avatarUrl" | "displayName" | "bio">;
  username: string;
  theme: ThemeConfig;
}

export function UserProfileHeader({
  creator,
  username,
  theme,
}: UserProfileHeaderProps) {
  const headerClasses = applyThemeClasses(theme, "header");
  const avatarClasses = applyThemeClasses(theme, "avatar");

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-5">
        {creator.avatarUrl ? (
          <div
            className={`h-[100px] w-[100px] overflow-hidden rounded-full shadow-xl ring-2 ring-offset-4 ${avatarClasses} ${theme.shadow} `}
          >
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
          <div
            className={`flex h-[100px] w-[100px] items-center justify-center rounded-full text-4xl shadow-lg ring-2 ring-offset-4 ${theme.cardBg} ${theme.textColor} ${avatarClasses} ${theme.shadow} `}
          >
            <span>{username?.[0]?.toUpperCase() ?? "A"}</span>
          </div>
        )}
      </div>

      <h1
        className={`text-center text-2xl font-bold tracking-tight ${headerClasses} ${theme.headingFont} `}
      >
        {creator.displayName ?? "ANON_USER"}
      </h1>

      <span
        className={`mb-3 text-sm ${theme.fontFamily.includes("mono") ? "font-mono" : ""} ${theme.accentColor} `}
      >
        @{username}
      </span>

      {creator.bio && (
        <p
          className={`mb-6 max-w-md text-center text-sm leading-relaxed ${theme.textColor} `}
        >
          {creator.bio}
        </p>
      )}
    </div>
  );
}

import Image from "next/image";
import { Link as LinkIconLucide } from "lucide-react";

import { getContentTypeIndicator } from "../_utils";
import { shouldUseRichPreview } from "../_utils";
import { ProfileShareModal } from "../_components/profile-share-modal";
import type { Link } from "@prisma/client";

interface LinkItemProps {
  link: Link;
}

export function LinkItem({ link }: LinkItemProps) {
  const useRichPreview = shouldUseRichPreview(link);
  const contentType = getContentTypeIndicator(link.type as string);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = "none";
  };

  if (useRichPreview && link.imageUrl) {
    return (
      <div className="group relative">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-xl bg-gray-800/80 shadow-lg transition-all duration-200 ease-in-out hover:bg-gray-700/70 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
        >
          <div className="relative h-44 w-full overflow-hidden">
            <Image
              src={link.imageUrl}
              alt={link.title}
              fill
              className={`${link.type === "music.playlist" ? "object-contain" : "object-cover"} transition-transform duration-300 group-hover:scale-105`}
              unoptimized
              onError={handleImageError}
            />
            {contentType && (
              <div className="absolute top-2.5 left-2.5 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {contentType}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-50"></div>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              {link.icon && (
                <div className="mt-0.5 flex-shrink-0">
                  <Image
                    src={link.icon}
                    alt={link.title}
                    width={20}
                    height={20}
                    className="rounded-sm"
                    onError={handleImageError}
                    unoptimized
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="mb-0.5 line-clamp-2 text-base font-semibold text-gray-100">
                  {link.title}
                </h3>
                {link.description && (
                  <p className="mb-1.5 line-clamp-2 text-xs text-gray-400">
                    {link.description}
                  </p>
                )}
                <p className="truncate text-xs text-amber-400/80 group-hover:text-amber-400">
                  {link.url.replace(/^https?:\/\//, "")}
                </p>
              </div>
            </div>
          </div>
        </a>

        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 transition-all duration-200 ease-in-out group-hover:opacity-100">
          <ProfileShareModal url={link.url} title={link.title} />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 rounded-xl bg-gray-800/80 p-4 shadow-lg transition-all duration-200 ease-in-out hover:bg-gray-700/70 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
      >
        <div className="flex-shrink-0">
          {link.icon ? (
            <Image
              src={link.icon}
              alt={link.title}
              width={28}
              height={28}
              className="rounded-md"
              onError={handleImageError}
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700/60">
              <LinkIconLucide size={20} className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-semibold text-gray-100">
            {link.title}
          </h3>
          <p className="truncate text-xs text-amber-400/80 group-hover:text-amber-400">
            {link.url.replace(/^https?:\/\//, "")}
          </p>
        </div>
        {(link.siteName ?? link.author) && (
          <div className="mt-2 ml-2 hidden flex-shrink-0 flex-col items-end text-right sm:flex">
            {link.siteName && (
              <span className="text-xs font-medium text-gray-400">
                {link.siteName}
              </span>
            )}
            {link.author && (
              <span className="text-xs text-gray-500">{link.author}</span>
            )}
          </div>
        )}
      </a>

      <div className="absolute top-[8px] right-[8px] z-10 opacity-0 transition-all duration-200 ease-in-out group-hover:opacity-100">
        <ProfileShareModal url={link.url} title={link.title} />
      </div>
    </div>
  );
}

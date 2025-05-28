"use client";

import React from "react";
import { Share2, Facebook, Twitter, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareModalProps {
  url: string;
  title: string;
  className?: string;
}

export function ProfileShareModal({
  url,
  title,
  className = "",
}: ShareModalProps) {
  const shareOptions = [
    {
      name: "X (Twitter)",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "hover:bg-black hover:text-white",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      color: "hover:bg-green-600 hover:text-white",
    },
    {
      name: "Copy Link",
      icon: Share2,
      action: () => {
        void navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      },
      color: "hover:bg-gray-600 hover:text-white",
    },
  ];

  const handleShare = (option: (typeof shareOptions)[0]) => {
    if (option.action) {
      option.action();
    } else if (option.url) {
      window.open(option.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`group flex h-8 w-8 items-center justify-center rounded-full bg-gray-700/60 transition-all duration-200 hover:bg-gray-600/80 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none ${className}`}
          title="Share link"
        >
          <Share2
            size={14}
            className="text-gray-400 transition-colors group-hover:text-gray-200"
          />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &quot;{title}&quot;</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleShare(option)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-800 transition-colors ${option.color}`}
            >
              <option.icon size={16} />
              {option.name}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

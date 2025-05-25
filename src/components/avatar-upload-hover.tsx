"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface AvatarUploadHoverProps {
  currentAvatarUrl?: string | null;
  displayName?: string;
  onFileSelected?: (file: File | null) => void;
  className?: string;
  disabled?: boolean;
}

export function AvatarUploadHover({
  currentAvatarUrl,
  displayName,
  onFileSelected,
  className = "h-24 w-24",
  disabled = false,
}: AvatarUploadHoverProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
      );
      return;
    }

    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 4MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    onFileSelected?.(file);

    event.target.value = "";
  };

  const displayUrl = previewUrl ?? currentAvatarUrl;

  return (
    <div className="group relative">
      <Avatar
        className={`${className} ${!disabled ? "cursor-pointer" : "cursor-default"} transition-all duration-200 ${!disabled ? "group-hover:brightness-75" : ""}`}
        onClick={handleAvatarClick}
      >
        <AvatarImage src={displayUrl ?? ""} />
        <AvatarFallback>
          {displayName?.substring(0, 2).toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>

      {!disabled && (
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          onClick={handleAvatarClick}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}

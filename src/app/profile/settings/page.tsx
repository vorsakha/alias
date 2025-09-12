"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useNostr } from "@/lib/nostr/nprofile-provider";
import {
  useProfile,
  useLinks,
  useTheme,
  usePublishProfile,
  usePublishLink,
  usePublishTheme,
} from "@/lib/nostr/query-hooks";
import { encodeNProfile } from "@/lib/nostr/bech32";
import type { LinkData } from "@/lib/nostr/events";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { themeOptions } from "@/app/_constants/theme";
import { ThemeSelector } from "@/components/theme-selector";
import { Trash2, GripVertical, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";

interface Metadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  favicon?: string;
  type?: string;
  siteName?: string;
  author?: string;
  canonical?: string;
  themeColor?: string;
  publishedTime?: string;
  modifiedTime?: string;
  videoUrl?: string;
  audioUrl?: string;
  album?: string;
  artist?: string;
  genre?: string;
  releaseDate?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const profileFormSchema = z
  .object({
    displayName: z
      .string()
      .min(2, { message: "Display name must be at least 2 characters." }),
    bio: z.string().optional(),
    avatarUrl: z
      .string()
      .url({ message: "Please enter a valid URL." })
      .optional()
      .nullable(),
    nip05: z
      .string()
      .email({ message: "Please enter a valid email address." })
      .optional()
      .nullable(),
    lightningAddress: z.string().optional().nullable(),
    links: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
          type: z.enum(["link", "wallet"]),
          description: z.string().optional().nullable(),
          imageUrl: z.string().optional().nullable(),
          icon: z.string().optional().nullable(),

          siteName: z.string().optional().nullable(),
          author: z.string().optional().nullable(),
          canonical: z.string().optional().nullable(),
          themeColor: z.string().optional().nullable(),
          publishedTime: z.string().optional().nullable(),
          modifiedTime: z.string().optional().nullable(),
          videoUrl: z.string().optional().nullable(),
          audioUrl: z.string().optional().nullable(),
          album: z.string().optional().nullable(),
          artist: z.string().optional().nullable(),
          genre: z.string().optional().nullable(),
          releaseDate: z.string().optional().nullable(),
          imageWidth: z.number().optional().nullable(),
          imageHeight: z.number().optional().nullable(),
          position: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      return data.lightningAddress && data.lightningAddress.length > 0;
    },
    {
      message: "Lightning address is required for zap functionality",
      path: ["lightningAddress"],
    },
  );

const websiteFormSchema = z.object({
  themeOption: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

export default function ProfileSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    clearDragState,
  } = useDragAndDrop();

  const { hasSigner, ndk, isInitializing, sessionRestored } = useNostr();
  const userPubkey = ndk?.activeUser?.pubkey;

  const publishProfileMutation = usePublishProfile();
  const publishLinkMutation = usePublishLink();
  const publishThemeMutation = usePublishTheme();

  useEffect(() => {
    if (isInitializing) return;

    if (!hasSigner && !sessionRestored) {
      router.push("/");
      return;
    }
  }, [hasSigner, isInitializing, sessionRestored, router]);

  const { data: profile, isLoading: profileLoading } = useProfile(
    userPubkey ?? "",
  );
  const { data: links, isLoading: linksLoading } = useLinks(userPubkey ?? "");
  const { data: theme, isLoading: themeLoading } = useTheme(userPubkey ?? "");

  const isLoading = profileLoading || linksLoading || themeLoading;

  const bitcoinProfile = profile
    ? {
        displayName: profile.name ?? "",
        bio: profile.about ?? "",
        avatarUrl: profile.picture ?? "",
        username: ndk?.activeUser?.npub ?? "unknown",
        lightningAddress: profile.lud16 ?? "",
        links: links ?? [],
      }
    : null;

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      avatarUrl: "",
      nip05: "",
      lightningAddress: "",
      links: [],
    },
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
    update: updateLink,
  } = useFieldArray({
    control: profileForm.control,
    name: "links",
  });

  const websiteForm = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      themeOption: themeOptions[0]?.value ?? "",
    },
  });

  useEffect(() => {
    if (profile && links) {
      profileForm.reset({
        displayName: profile.name ?? "",
        bio: profile.about ?? "",
        avatarUrl: profile.picture ?? "",
        nip05: profile.nip05 ?? "",
        lightningAddress: profile.lud16 ?? "",
        links: links || [],
      });
    }
  }, [profile, links, profileForm]);

  useEffect(() => {
    if (theme) {
      websiteForm.reset({
        themeOption: theme.themeOption ?? themeOptions[0]?.value ?? "",
      });
    } else if (!themeLoading) {
      websiteForm.reset({
        themeOption: themeOptions[0]?.value ?? "",
      });
    }
  }, [theme, themeLoading, websiteForm]);

  const [isPublishingProfile, setIsPublishingProfile] = useState(false);
  const [isPublishingWebsite, setIsPublishingWebsite] = useState(false);

  async function fetchUrlMetadata(url: string): Promise<Metadata> {
    try {
      return {
        title: url,
        description: "",
        type: "website",
      };
    } catch (error) {
      console.error("Failed to fetch URL metadata:", error);
      return {
        title: url,
        description: "",
        type: "website",
      };
    }
  }

  async function handleAddLink() {
    if (!newLinkUrl.trim() || !userPubkey) return;

    try {
      setIsAddingLink(true);
      const currentLinks = profileForm.getValues("links") ?? [];

      const isUrl = /^https?:\/\//.test(newLinkUrl);
      const type = isUrl ? "link" : "wallet";

      let title = newLinkUrl;
      let metadata: Metadata = {};

      if (isUrl) {
        metadata = await fetchUrlMetadata(newLinkUrl);
        title = metadata.title ?? newLinkUrl;
      } else {
        title = `${newLinkUrl.slice(0, 8)}...${newLinkUrl.slice(-8)}`;
      }

      const linkData: LinkData & { pubkey: string } = {
        id: `link-${Date.now()}`,
        title: title,
        url: newLinkUrl,
        type: type,
        description: metadata.description ?? "",
        imageUrl: metadata.imageUrl ?? undefined,
        icon: metadata.favicon ?? undefined,
        siteName: metadata.siteName ?? undefined,
        author: metadata.author ?? undefined,
        canonical: metadata.canonical ?? undefined,
        themeColor: metadata.themeColor ?? undefined,
        publishedTime: metadata.publishedTime ?? undefined,
        modifiedTime: metadata.modifiedTime ?? undefined,
        videoUrl: metadata.videoUrl ?? undefined,
        audioUrl: metadata.audioUrl ?? undefined,
        album: metadata.album ?? undefined,
        artist: metadata.artist ?? undefined,
        genre: metadata.genre ?? undefined,
        releaseDate: metadata.releaseDate ?? undefined,
        imageWidth: metadata.imageWidth ?? undefined,
        imageHeight: metadata.imageHeight ?? undefined,
        position: currentLinks.length,
        isActive: true,
        is_active: true,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        pubkey: userPubkey,
      };

      const success = await publishLinkMutation.mutateAsync(linkData);

      if (success) {
        appendLink({
          url: newLinkUrl,
          title: title,
          type: type,
          description: metadata.description ?? "",
          imageUrl: metadata.imageUrl ?? undefined,
          icon: metadata.favicon ?? undefined,
          siteName: metadata.siteName ?? undefined,
          author: metadata.author ?? undefined,
          canonical: metadata.canonical ?? undefined,
          themeColor: metadata.themeColor ?? undefined,
          publishedTime: metadata.publishedTime ?? undefined,
          modifiedTime: metadata.modifiedTime ?? undefined,
          videoUrl: metadata.videoUrl ?? undefined,
          audioUrl: metadata.audioUrl ?? undefined,
          album: metadata.album ?? undefined,
          artist: metadata.artist ?? undefined,
          genre: metadata.genre ?? undefined,
          releaseDate: metadata.releaseDate ?? undefined,
          imageWidth: metadata.imageWidth ?? undefined,
          imageHeight: metadata.imageHeight ?? undefined,
          position: currentLinks.length,
          isActive: true,
        });

        setNewLinkUrl("");
        toast.success(
          `${type === "link" ? "Link" : "Wallet"} added successfully`,
        );
      } else {
        toast.error(`Failed to add ${type}`);
      }
    } catch (err) {
      console.error("Addition error:", err);
      toast.error("Failed to add item");
    } finally {
      setIsAddingLink(false);
    }
  }

  function toggleLinkActive(index: number) {
    const currentLink = linkFields[index];
    if (currentLink) {
      updateLink(index, {
        ...currentLink,
        isActive: !currentLink.isActive,
      });
    }
  }

  async function handleRemoveLink(index: number) {
    const link = linkFields[index];
    if (!link) return;

    try {
      removeLink(index);
      toast.success("Link removed");
    } catch (error) {
      console.error("Link removal error:", error);
      toast.error("Failed to remove link");
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || draggedIndex === dropIndex) {
        clearDragState();
        return;
      }

      const linkFields = profileForm.getValues("links") ?? [];
      const newLinks = [...linkFields];

      const draggedItem = newLinks[draggedIndex];
      if (!draggedItem) return;

      newLinks.splice(draggedIndex, 1);

      newLinks.splice(dropIndex, 0, draggedItem);

      newLinks.forEach((link, i) => {
        if (link) {
          link.position = i;
        }
      });

      profileForm.setValue("links", newLinks);
      clearDragState();
    },
    [draggedIndex, clearDragState, profileForm],
  );

  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      setIsPublishingProfile(true);
      const avatarUrl = data.avatarUrl;

      const profileSuccess = await publishProfileMutation.mutateAsync({
        name: data.displayName,
        about: data.bio,
        picture: avatarUrl ?? undefined,
        nip05: data.nip05 ?? undefined,
        lud16: data.lightningAddress ?? undefined,
      });

      if (profileSuccess) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsPublishingProfile(false);
    }
  }

  async function onWebsiteSubmit(data: WebsiteFormValues) {
    try {
      setIsPublishingWebsite(true);

      const success = await publishThemeMutation.mutateAsync({
        themeOption: data.themeOption,
        pubkey: userPubkey ?? "",
      });

      if (success) {
        toast.success("Website settings updated successfully");
      } else {
        toast.error("Failed to update website settings");
      }
    } catch (error) {
      console.error("Website update error:", error);
      toast.error("Failed to update website settings");
    } finally {
      setIsPublishingWebsite(false);
    }
  }

  function handlePreview() {
    if (userPubkey) {
      try {
        const nprofile = encodeNProfile(userPubkey, []);
        window.open(`/${nprofile}`, "_blank");
      } catch (error) {
        console.error("Failed to generate nprofile for preview:", error);

        window.open(`/${userPubkey}`, "_blank");
      }
    }
  }

  if (isLoading || isInitializing || (!hasSigner && !sessionRestored)) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="relative z-10 flex h-screen items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-purple-500/20"></div>
              <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-purple-400 border-r-purple-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bitcoinProfile) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="relative z-10 container mx-auto py-10">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">
                Welcome to Nostr Links! 🎉
              </CardTitle>
              <CardDescription className="text-gray-400">
                Let&apos;s set up your decentralized profile. Fill out the form
                below to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">📝</span>
                  <span>Your profile will be stored on the Nostr network</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">🔐</span>
                  <span>
                    You own your data - no central authority can take it away
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">⚡</span>
                  <span>Receive instant Lightning payments from your fans</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 container mx-auto max-w-4xl py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Profile Settings
            </h1>
            <p className="text-gray-400">
              Manage your profile and customization options.
            </p>
          </div>
          <Button
            onClick={handlePreview}
            className="bg-white font-semibold text-black hover:bg-gray-100"
          >
            Preview Profile
          </Button>
        </div>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 border-white/10 bg-white/5">
            <TabsTrigger
              value="profile"
              className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Profile Information
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your basic profile information and Lightning address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-400 bg-gray-600 text-2xl font-bold text-white">
                        {profileForm.watch("avatarUrl") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profileForm.watch("avatarUrl") ?? ""}
                            alt="Avatar"
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          bitcoinProfile?.displayName
                            ?.charAt(0)
                            ?.toUpperCase() || "?"
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          @{bitcoinProfile?.username ?? "unknown"}
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Enter an image URL below to set your avatar
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Display Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your display name"
                              {...field}
                              className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Avatar URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/avatar.jpg"
                              {...field}
                              value={field.value ?? ""}
                              className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            URL to your profile picture. Must be a valid image
                            URL.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself"
                              className="min-h-32 border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            A short bio about yourself. This will be displayed
                            on your profile.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="nip05"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            NIP-05 Identifier
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@domain.com"
                              {...field}
                              value={field.value ?? ""}
                              className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Your NIP-05 identifier (e.g., you@domain.com). This
                            will be used as your username and for verification.{" "}
                            <a
                              href="https://nostr.how/en/guides/get-verified"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 underline hover:text-purple-300"
                            >
                              Learn how to verify your profile
                            </a>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <h3 className="mb-1 pt-4 text-lg font-medium text-white">
                      Lightning Address
                    </h3>
                    <p className="mb-4 text-sm text-gray-400">
                      Your Lightning address for receiving zaps.
                    </p>

                    <FormField
                      control={profileForm.control}
                      name="lightningAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Lightning Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@lightning.address"
                              {...field}
                              value={field.value ?? ""}
                              className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-orange-400"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Your Lightning address for receiving payments (e.g.
                            you@getalby.com).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <h3 className="mb-1 pt-4 text-lg font-medium text-white">
                      Links & Addresses
                    </h3>
                    <p className="mb-4 text-sm text-gray-400">
                      Add custom links to your profile page or wallet addresses
                      for donations.
                    </p>

                    <div className="space-y-4 rounded-lg border border-white/20 bg-white/5 p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com or bc1..."
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleAddLink();
                            }
                          }}
                          disabled={isAddingLink}
                          className="border-white/20 bg-white/10 text-white placeholder-gray-400"
                        />
                        <Button
                          type="button"
                          onClick={handleAddLink}
                          disabled={!newLinkUrl.trim() || isAddingLink}
                          size="sm"
                          className="bg-purple-600 text-white hover:bg-purple-700"
                        >
                          {isAddingLink ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          {isAddingLink ? "Adding..." : "Add Link"}
                        </Button>
                      </div>
                    </div>

                    {linkFields.length > 0 && (
                      <div className="space-y-2">
                        {linkFields.map((field, index) => (
                          <div
                            key={field.id}
                            className={`flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 p-3 transition-colors ${
                              draggedIndex === index
                                ? "opacity-50"
                                : dragOverIndex === index
                                  ? "border-purple-400 bg-purple-500/10"
                                  : ""
                            }`}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                          >
                            <div
                              className="cursor-grab text-gray-400 hover:text-gray-300 active:cursor-grabbing"
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleDragStart(index);

                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.dropEffect = "move";

                                const dragImage = document.createElement("div");
                                dragImage.style.position = "absolute";
                                dragImage.style.top = "-1000px";
                                dragImage.style.width = "1px";
                                dragImage.style.height = "1px";
                                dragImage.style.backgroundColor = "transparent";
                                document.body.appendChild(dragImage);
                                e.dataTransfer.setDragImage(dragImage, 0, 0);

                                setTimeout(() => {
                                  document.body.removeChild(dragImage);
                                }, 0);
                              }}
                              onDragEnd={(e) => {
                                e.stopPropagation();
                                clearDragState();
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            {field.icon && (
                              <span className="mr-2 text-lg" aria-label="icon">
                                <Image
                                  src={field.icon}
                                  alt="favicon"
                                  width={25}
                                  height={25}
                                  className="inline-block rounded"
                                  style={{ verticalAlign: "middle" }}
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                  unoptimized
                                />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-white">
                                {field.title}
                              </div>
                              <div className="truncate text-xs text-gray-400">
                                {field.url}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={field.isActive ?? true}
                                  onCheckedChange={() =>
                                    toggleLinkActive(index)
                                  }
                                />
                                <span className="text-xs text-gray-400">
                                  {field.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveLink(index)}
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isPublishingProfile}
                      className="bg-white font-semibold text-black hover:bg-gray-100"
                    >
                      {isPublishingProfile ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Website & Appearance
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Customize your landing page appearance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...websiteForm}>
                  <form
                    onSubmit={websiteForm.handleSubmit(onWebsiteSubmit)}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Theme
                        </h3>
                        <p className="text-sm text-gray-400">
                          Choose a theme for your profile page and widget.
                        </p>
                      </div>

                      <FormField
                        control={websiteForm.control}
                        name="themeOption"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <ThemeSelector
                                value={field.value}
                                onValueChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isPublishingWebsite}
                      className="bg-white font-semibold text-black hover:bg-gray-100"
                    >
                      {isPublishingWebsite
                        ? "Saving..."
                        : "Save Appearance Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { WalletType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, GripVertical, Plus, Loader2 } from "lucide-react";
import type { Metadata } from "@/app/api/url-metadata/route";
import Image from "next/image";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import { AvatarUploadHover } from "@/components/avatar-upload-hover";

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

    lightningAddress: z.string().optional().nullable(),
    bitcoinAddress: z.string().optional().nullable(),
    ethereumAddress: z.string().optional().nullable(),
    solanaAddress: z.string().optional().nullable(),
    dogeAddress: z.string().optional().nullable(),
    moneroAddress: z.string().optional().nullable(),
    mainWallet: z.nativeEnum(WalletType),

    links: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          type: z.string(),
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
      const walletAddresses = [
        data.lightningAddress,
        data.bitcoinAddress,
        data.ethereumAddress,
        data.solanaAddress,
        data.dogeAddress,
        data.moneroAddress,
      ];

      return walletAddresses.some((address) => address && address.length > 0);
    },
    {
      message: "At least one wallet address is required",
      path: ["lightningAddress"],
    },
  );

const walletFields: {
  field: keyof ProfileFormValues;
  label: string;
  type: WalletType;
}[] = [
  { field: "lightningAddress", label: "Lightning", type: WalletType.LIGHTNING },
  { field: "bitcoinAddress", label: "Bitcoin", type: WalletType.BITCOIN },
  { field: "ethereumAddress", label: "Ethereum", type: WalletType.ETHEREUM },
  { field: "solanaAddress", label: "Solana", type: WalletType.SOLANA },
  { field: "dogeAddress", label: "Doge", type: WalletType.DOGE },
  { field: "moneroAddress", label: "Monero", type: WalletType.MONERO },
];

const websiteFormSchema = z.object({
  themeOption: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

export default function CreatorSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    clearDragState,
  } = useDragAndDrop();

  const { data: session, isLoading: sessionLoading } =
    api.profiles.getSession.useQuery();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/");
    }
  }, [session, sessionLoading, router]);

  const { data: creator, isLoading } =
    api.profiles.getCurrentCreator.useQuery();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      avatarUrl: "",
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
    if (creator) {
      profileForm.reset({
        displayName: creator.displayName,
        bio: creator.bio ?? "",
        avatarUrl: creator.avatarUrl ?? "",
        lightningAddress: creator.wallets?.lightningAddress ?? "",
        bitcoinAddress: creator.wallets?.bitcoinAddress ?? "",
        ethereumAddress: creator.wallets?.ethereumAddress ?? "",
        solanaAddress: creator.wallets?.solanaAddress ?? "",
        dogeAddress: creator.wallets?.dogeAddress ?? "",
        moneroAddress: creator.wallets?.moneroAddress ?? "",
        mainWallet: creator.wallets?.mainWallet ?? undefined,
        links: creator.links ?? [],
      });

      websiteForm.reset({
        themeOption: creator.theme ?? themeOptions[0]?.value ?? "",
      });
    }
  }, [creator, profileForm, websiteForm]);

  const currentMainWallet = profileForm.watch("mainWallet");
  useEffect(() => {
    if (!currentMainWallet) return;

    const walletTypeToField: Record<WalletType, keyof ProfileFormValues> = {
      [WalletType.LIGHTNING]: "lightningAddress",
      [WalletType.BITCOIN]: "bitcoinAddress",
      [WalletType.ETHEREUM]: "ethereumAddress",
      [WalletType.SOLANA]: "solanaAddress",
      [WalletType.DOGE]: "dogeAddress",
      [WalletType.MONERO]: "moneroAddress",
    };

    const correspondingField = walletTypeToField[currentMainWallet];
    const addressValue = profileForm.watch(correspondingField);

    if (!addressValue || addressValue.length === 0) {
      profileForm.setValue("mainWallet", undefined as unknown as WalletType);
    }
  }, [currentMainWallet, profileForm]);

  const walletValues = profileForm.watch(walletFields.map((w) => w.field));
  const walletsOptions = useMemo(
    () =>
      walletFields
        .filter((_, i) => walletValues[i]?.length ?? 0 > 0)
        .map((wallet) => ({
          label: wallet.label,
          value: wallet.type,
        })),
    [walletValues],
  );

  const profileMutation = api.profiles.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const websiteMutation = api.profiles.updateProfileExtras.useMutation({
    onSuccess: () => {
      toast.success("Website settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update website settings");
    },
  });

  const { startUpload, isUploading: isUploadingAvatar } = useUploadThing(
    "avatarUploader",
    {
      onUploadError: (error: Error) => {
        toast.error(`Avatar upload failed: ${error.message}`);
      },
    },
  );

  async function fetchUrlMetadata(url: string): Promise<Metadata> {
    const response = await fetch("/api/url-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch metadata");
    }

    const data = (await response.json()) as Metadata;
    return data;
  }

  async function handleAddLink() {
    if (!newLinkUrl.trim()) return;

    try {
      setIsAddingLink(true);
      const metadata = await fetchUrlMetadata(newLinkUrl);
      const currentLinks = profileForm.getValues("links") ?? [];

      appendLink({
        url: newLinkUrl,
        icon: metadata.favicon ?? undefined,
        description: metadata.description ?? "",
        isActive: true,
        position: currentLinks.length,
        ...metadata,
      });

      setNewLinkUrl("");
      toast.success("Link added successfully");
    } catch {
      toast.error("Failed to add link");
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
      const finalData = { ...data };

      if (selectedAvatarFile) {
        const uploadResult = await startUpload([selectedAvatarFile]);
        if (uploadResult?.[0]?.url) {
          finalData.avatarUrl = uploadResult[0].url;
        } else {
          toast.error("Failed to upload avatar");
          return;
        }
      }

      profileMutation.mutate(finalData);
      setSelectedAvatarFile(null);
    } catch {
      toast.error("Failed to update profile");
    }
  }

  function onWebsiteSubmit(data: WebsiteFormValues) {
    websiteMutation.mutate({
      theme: data.themeOption,
    });
  }

  function handlePreview() {
    if (creator?.username) {
      window.open(`/${creator.username}`, "_blank");
    }
  }

  if (isLoading || sessionLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="relative z-10 flex h-screen items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-400"></div>
            <span className="text-white">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="relative z-10 container mx-auto py-10">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">
                Creator Profile Not Found
              </CardTitle>
              <CardDescription className="text-gray-400">
                You need to create a creator profile first.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={() => router.push("/creator/create")}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                Create Creator Profile
              </Button>
            </CardFooter>
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
              Creator Settings
            </h1>
            <p className="text-gray-400">
              Manage your creator profile and customization options.
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
              Website & Appearance
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
                      <AvatarUploadHover
                        currentAvatarUrl={profileForm.watch("avatarUrl")}
                        displayName={creator?.displayName}
                        onFileSelected={(file) => {
                          setSelectedAvatarFile(file);
                        }}
                        className="h-24 w-24"
                        disabled={
                          profileMutation.isPending || isUploadingAvatar
                        }
                      />
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          @{creator?.username ?? "unknown"}
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Click on your avatar to change it
                          {selectedAvatarFile && (
                            <span className="text-purple-400">
                              {" "}
                              (New image selected - save to upload)
                            </span>
                          )}
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

                    <h3 className="mb-1 pt-4 text-lg font-medium text-white">
                      Wallets
                    </h3>
                    <p className="mb-4 text-sm text-gray-400">
                      Add your wallets to your profile.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
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
                              Your Lightning address for receiving payments
                              (e.g. you@getalby.com).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bitcoinAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Bitcoin Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="bc1..."
                                {...field}
                                value={field.value ?? ""}
                                className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-orange-400"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Your Bitcoin address for receiving payments.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="ethereumAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Ethereum Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0x..."
                                {...field}
                                value={field.value ?? ""}
                                className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-orange-400"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Your Ethereum address for receiving payments.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="solanaAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Solana Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="..."
                                {...field}
                                value={field.value ?? ""}
                                className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-orange-400"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Your Solana address for receiving payments.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="dogeAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Doge Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="..."
                                {...field}
                                value={field.value ?? ""}
                                className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-orange-400"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Your Doge address for receiving payments.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="moneroAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Monero Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="..."
                                {...field}
                                value={field.value ?? ""}
                                className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-orange-400"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Your Monero address for receiving payments.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="mainWallet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">
                              Highlighted Wallet
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? undefined}
                                disabled={profileMutation.isPending}
                              >
                                <SelectTrigger className="border-white/20 bg-white/10 text-white">
                                  <SelectValue placeholder="Select the wallet to showcase in your profile" />
                                </SelectTrigger>
                                <SelectContent className="border-white/20 bg-black/90 backdrop-blur-sm">
                                  {walletsOptions.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                      className="text-white hover:bg-white/10"
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                  {!walletsOptions.length && (
                                    <SelectItem
                                      value="none"
                                      disabled
                                      className="text-gray-400"
                                    >
                                      No wallet selected
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <h3 className="mb-1 pt-4 text-lg font-medium text-white">
                      Links
                    </h3>
                    <p className="mb-4 text-sm text-gray-400">
                      Add custom links to your profile page.
                    </p>

                    <div className="space-y-4 rounded-lg border border-white/20 bg-white/5 p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://example.com"
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
                                onClick={() => removeLink(index)}
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
                      disabled={profileMutation.isPending || isUploadingAvatar}
                      className="bg-white font-semibold text-black hover:bg-gray-100"
                    >
                      {profileMutation.isPending || isUploadingAvatar
                        ? "Saving..."
                        : "Save Profile"}
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
                      disabled={websiteMutation.isPending}
                      className="bg-white font-semibold text-black hover:bg-gray-100"
                    >
                      {websiteMutation.isPending
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

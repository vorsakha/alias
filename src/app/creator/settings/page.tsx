"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { themeOptions } from "@/app/_constants/theme";
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
  customTheme: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

export default function CreatorSettings() {
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
      customTheme: "",
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

      const currentTheme = creator.theme ?? themeOptions?.[0]?.value ?? "";
      const isCustomTheme = !themeOptions.some(
        (option) => option.value === currentTheme && option.value !== "custom",
      );

      websiteForm.reset({
        themeOption: isCustomTheme ? "custom" : currentTheme,
        customTheme: isCustomTheme ? currentTheme : "",
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

  function onProfileSubmit(data: ProfileFormValues) {
    profileMutation.mutate(data);
  }

  function onWebsiteSubmit(data: WebsiteFormValues) {
    const finalTheme =
      data.themeOption === "custom" ? data.customTheme : data.themeOption;

    websiteMutation.mutate({
      theme: finalTheme,
    });
  }

  function handlePreview() {
    if (creator?.username) {
      window.open(`/${creator.username}`, "_blank");
    }
  }

  if (isLoading || sessionLoading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Creator Profile Not Found</CardTitle>
            <CardDescription>
              You need to create a creator profile first.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/creator/create")}>
              Create Creator Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Creator Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your creator profile and customization options.
          </p>
        </div>
        <Button onClick={handlePreview}>Preview Profile</Button>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="appearance">Website & Appearance</TabsTrigger>
        </TabsList>

        {/* Profile Information Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
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
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileForm.watch("avatarUrl") ?? ""} />
                      <AvatarFallback>
                        {creator?.displayName?.substring(0, 2).toUpperCase() ??
                          ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">
                        @{creator?.username ?? "unknown"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Your profile URL:{" "}
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/${creator?.username ?? "unknown"}`
                          : `/${creator?.username ?? "unknown"}`}
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your display name" {...field} />
                        </FormControl>
                        <FormDescription>
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
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A short bio about yourself. This will be displayed on
                          your profile.
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
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/avatar.jpg"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          A URL to your profile image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <h3 className="mb-1 pt-4 text-lg font-medium">Wallets</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Add your wallets to your profile.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="lightningAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lightning Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@lightning.address"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your Lightning address for receiving payments (e.g.
                            you@getalby.com).
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
                          <FormLabel>Bitcoin Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="bc1..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
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
                          <FormLabel>Ethereum Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0x..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
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
                          <FormLabel>Solana Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
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
                          <FormLabel>Doge Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
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
                          <FormLabel>Monero Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
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
                          <FormLabel>Highlighted Wallet</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? undefined}
                              disabled={profileMutation.isPending}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select the wallet to showcase in your profile" />
                              </SelectTrigger>
                              <SelectContent>
                                {walletsOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                                {!walletsOptions.length && (
                                  <SelectItem value="none" disabled>
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

                  <h3 className="mb-1 pt-4 text-lg font-medium">Links</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Add custom links to your profile page.
                  </p>

                  {/* Add Link Form */}
                  <div className="space-y-4 rounded-lg border p-4">
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
                      />
                      <Button
                        type="button"
                        onClick={handleAddLink}
                        disabled={!newLinkUrl.trim() || isAddingLink}
                        size="sm"
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

                  {/* Links List */}
                  {linkFields.length > 0 && (
                    <div className="space-y-2">
                      {linkFields.map((field, index) => (
                        <div
                          key={field.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                            draggedIndex === index
                              ? "bg-muted opacity-50"
                              : dragOverIndex === index
                                ? "border-primary bg-primary/5"
                                : ""
                          }`}
                        >
                          <div
                            className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                            onMouseDown={(e) => e.stopPropagation()}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={clearDragState}
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
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                                unoptimized
                              />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {field.title}
                            </div>
                            <div className="text-muted-foreground truncate text-xs">
                              {field.url}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.isActive ?? true}
                                onCheckedChange={() => toggleLinkActive(index)}
                              />
                              <span className="text-muted-foreground text-xs">
                                {field.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLink(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button type="submit" disabled={profileMutation.isPending}>
                    {profileMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website & Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Website & Appearance</CardTitle>
              <CardDescription>
                Customize your Carrd-style landing page and widget appearance.
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
                      <h3 className="text-lg font-medium">Theme</h3>
                      <p className="text-muted-foreground text-sm">
                        Choose a theme for your profile page and widget.
                      </p>
                    </div>

                    <div
                      className={`${websiteForm.watch("themeOption")} mb-6 flex h-40 items-center justify-center rounded-lg border p-4 shadow-sm`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-white drop-shadow-md">
                          Theme Preview
                        </p>
                        <p className="mt-2 max-w-md text-sm text-white/90 drop-shadow-md">
                          This is how your theme will look on your profile page
                          and widget
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={websiteForm.control}
                      name="themeOption"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Select Theme</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
                            >
                              {themeOptions.map((theme) => (
                                <div key={theme.value}>
                                  <RadioGroupItem
                                    value={theme.value}
                                    id={theme.value}
                                    className="peer sr-only"
                                  />
                                  <label
                                    htmlFor={theme.value}
                                    className="hover:bg-muted peer-data-[state=checked]:border-primary [&:has(.peer-data-[state=checked])]:border-primary flex cursor-pointer flex-col space-y-2 rounded-md border p-4"
                                  >
                                    <div
                                      className={`${theme.preview} h-16 w-full rounded-md`}
                                    ></div>
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-medium">
                                          {theme.label}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                          {theme.description}
                                        </p>
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {websiteForm.watch("themeOption") === "custom" && (
                      <FormField
                        control={websiteForm.control}
                        name="customTheme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Theme Classes</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="bg-gradient-to-r from-cyan-500 to-blue-500"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter Tailwind CSS classes for your custom theme
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Button type="submit" disabled={websiteMutation.isPending}>
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
  );
}

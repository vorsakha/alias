"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { themeOptions } from "@/app/_constants/theme";

const profileFormSchema = z.object({
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
  xUsername: z.string().optional().nullable(),
  instagramUsername: z.string().optional().nullable(),
  githubUsername: z.string().optional().nullable(),
  facebookUsername: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  nostrPubkey: z.string().optional().nullable(),
});

const websiteFormSchema = z.object({
  websiteUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .nullable(),
  themeOption: z.string(),
  customTheme: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

export default function CreatorSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: session, isLoading: sessionLoading } =
    api.profiles.getSession.useQuery();

  // Handle redirects based on auth
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
    },
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
        lightningAddress: creator.lightningAddress ?? "",
        xUsername: creator.xUsername ?? "",
        instagramUsername: creator.instagramUsername ?? "",
        githubUsername: creator.githubUsername ?? "",
        facebookUsername: creator.facebookUsername ?? "",
        email: creator.email ?? "",
        nostrPubkey: creator.nostrPubkey ?? "",
      });

      const currentTheme = creator.theme ?? themeOptions?.[0]?.value ?? "";
      const isCustomTheme = !themeOptions.some(
        (option) => option.value === currentTheme && option.value !== "custom",
      );

      websiteForm.reset({
        websiteUrl: creator.websiteUrl ?? null,
        themeOption: isCustomTheme ? "custom" : currentTheme,
        customTheme: isCustomTheme ? currentTheme : "",
      });
    }
  }, [creator, profileForm, websiteForm]);

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

  function onProfileSubmit(data: ProfileFormValues) {
    profileMutation.mutate(data);
  }

  function onWebsiteSubmit(data: WebsiteFormValues) {
    const finalTheme =
      data.themeOption === "custom" ? data.customTheme : data.themeOption;

    websiteMutation.mutate({
      websiteUrl: data.websiteUrl,
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
                        {creator.displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">
                        @{creator.username}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Your profile URL:{" "}
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/${creator.username}`
                          : `/${creator.username}`}
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

                  <h3 className="pt-4 text-lg font-medium">Social Media</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Connect your social media accounts to your profile.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="xUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="yourusername"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your X username without the @ symbol.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="instagramUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="yourusername"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your Instagram username without the @ symbol.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="githubUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="yourusername"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your GitHub username.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="facebookUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="yourusername"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your Facebook username or page name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            A public email people can contact you at.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="nostrPubkey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nostr Public Key</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="npub..."
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your Nostr public key (npub format).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                  <FormField
                    control={websiteForm.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          A link to your personal website or social media.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Theme</h3>
                      <p className="text-muted-foreground text-sm">
                        Choose a theme for your profile page and widget.
                      </p>
                    </div>

                    {/* Theme Preview */}
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

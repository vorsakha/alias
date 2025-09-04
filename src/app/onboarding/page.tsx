"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";

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
import { AvatarUploadHover } from "@/components/avatar-upload-hover";
import { themeOptions } from "@/app/_constants/theme";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(6, { message: "Username must be at least 6 characters." })
    .regex(/^[a-z0-9_]+$/, {
      message:
        "Username can only contain lowercase letters, numbers, and underscores.",
    }),
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." }),
  avatarUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .nullable(),
  lightningAddress: z
    .string()
    .min(1, { message: "Lightning address is required" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );

  const { data: session, isLoading: sessionLoading } =
    api.profiles.getSession.useQuery();
  const { data: hasProfile, isLoading: checkingProfile } =
    api.profiles.hasProfile.useQuery(undefined, { enabled: !!session?.user });

  useEffect(() => {
    if (!sessionLoading && !session?.user) router.push("/");
    if (!checkingProfile && session?.user && hasProfile)
      router.push("/creator/settings");
  }, [session, sessionLoading, hasProfile, checkingProfile, router]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      displayName: session?.user?.name ?? "",
      avatarUrl: session?.user?.image ?? null,
      lightningAddress: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      profileForm.setValue("displayName", session.user.name ?? "");
      profileForm.setValue("avatarUrl", session.user.image ?? "");
    }
  }, [session, profileForm]);

  const createProfileMutation = api.profiles.createProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile created successfully!");
      router.push("/creator/settings");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create profile. Please try again.";
      if (errorMessage.includes("username")) {
        toast.error("Username already taken. Please choose another.");
        profileForm.setError("username", {
          type: "manual",
          message: "Username already taken. Please choose another.",
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const { startUpload, isUploading: isUploadingAvatar } = useUploadThing(
    "avatarUploader",
    {
      onUploadError: (error: Error) => {
        toast.error(`Avatar upload failed: ${error.message}`);
        return;
      },
    },
  );

  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      const finalData = { ...data } as ProfileFormValues & { username: string };

      if (selectedAvatarFile) {
        const uploadResult = await startUpload([selectedAvatarFile]);
        if (uploadResult?.[0]?.url) finalData.avatarUrl = uploadResult[0].url;
        else {
          toast.error("Failed to upload avatar");
          return;
        }
      }

      createProfileMutation.mutate({
        ...finalData,
        theme: themeOptions[0]?.value,
      });
      setSelectedAvatarFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create profile");
    }
  }

  if (sessionLoading || checkingProfile) {
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

  if (!session?.user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 container mx-auto max-w-4xl py-10">
        <Card className="mx-auto max-w-3xl border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white">
              Set Up Your Creator Profile
            </CardTitle>
            <CardDescription className="text-gray-400">
              Complete the minimum required fields to get started; you can
              customize more settings later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="mb-6 flex flex-col items-center">
                  <AvatarUploadHover
                    currentAvatarUrl={profileForm.watch("avatarUrl")}
                    displayName={profileForm.watch("displayName")}
                    onFileSelected={(file) => setSelectedAvatarFile(file)}
                    className="h-24 w-24"
                    disabled={
                      createProfileMutation.isPending || isUploadingAvatar
                    }
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="yourusername"
                          {...field}
                          className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Choose a unique username for your profile URL. This
                        cannot be changed later.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Display Name</FormLabel>
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

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-white font-semibold text-black hover:bg-gray-100"
                    size="lg"
                    disabled={createProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending
                      ? "Creating Profile..."
                      : "Create My Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

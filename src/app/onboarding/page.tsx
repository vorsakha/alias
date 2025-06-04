"use client";

import { useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  bio: z.string().optional(),
  avatarUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .nullable(),
  lightningAddress: z.string(),
  themeOption: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function OnboardingPage() {
  const router = useRouter();

  const { data: session, isLoading: sessionLoading } =
    api.profiles.getSession.useQuery();
  const { data: hasProfile, isLoading: checkingProfile } =
    api.profiles.hasProfile.useQuery(undefined, { enabled: !!session?.user });

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/");
    }

    if (!checkingProfile && session?.user && hasProfile) {
      router.push("/settings");
    }
  }, [session, sessionLoading, hasProfile, checkingProfile, router]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      displayName: session?.user?.name ?? "",
      bio: "",
      avatarUrl: session?.user?.image ?? "",
      lightningAddress: "",
      themeOption: themeOptions[0]?.value,
    },
  });
  const { watch, setValue } = profileForm;

  useEffect(() => {
    if (session?.user) {
      setValue("displayName", session.user.name ?? "");
      setValue("avatarUrl", session.user.image ?? "");
    }
  }, [session, setValue]);

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

  function onSubmit(data: ProfileFormValues) {
    createProfileMutation.mutate({
      username: data.username,
      displayName: data.displayName,
      bio: data.bio ?? "",
      avatarUrl: data.avatarUrl ?? null,
      lightningAddress: data.lightningAddress ?? null,
      theme: data.themeOption,
    });
  }

  if (sessionLoading || checkingProfile) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="relative z-10 flex h-screen items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
            <span className="text-white">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

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
              Complete your profile to start receiving tips and payments with
              Bitcoin Lightning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="mb-6 flex flex-col items-center">
                  <Avatar className="mb-4 h-24 w-24 border-2 border-white/20">
                    <AvatarImage src={profileForm.watch("avatarUrl") ?? ""} />
                    <AvatarFallback className="bg-purple-600/20 text-white">
                      {profileForm
                        .watch("displayName")
                        ?.substring(0, 2)
                        .toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
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
                      <FormLabel className="text-white">Avatar URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/avatar.jpg"
                          {...field}
                          value={field.value ?? ""}
                          className="border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
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

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      Profile Theme
                    </h3>
                    <p className="text-sm text-gray-400">
                      Choose a theme for your profile page.
                    </p>
                  </div>

                  <div
                    className={`${watch("themeOption")} mb-6 flex h-32 items-center justify-center rounded-lg border border-white/20 p-4 shadow-sm`}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-white drop-shadow-md">
                        Theme Preview
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="themeOption"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {themeOptions.map((theme) => (
                              <div
                                key={theme.value}
                                className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-lg ${
                                  field.value === theme.value
                                    ? "border-purple-400 bg-purple-500/10"
                                    : "border-white/20 bg-white/5 hover:border-white/30"
                                }`}
                                onClick={() => field.onChange(theme.value)}
                              >
                                <div
                                  className={`${theme.preview} mb-2 h-16 w-full rounded-md`}
                                ></div>
                                <p className="font-medium text-white">
                                  {theme.label}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {theme.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

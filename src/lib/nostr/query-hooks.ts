"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNostr } from "./nprofile-provider";
import type { ProfileData, LinkData, ThemeData, ZapData } from "./events";

export const nostrQueryKeys = {
  all: ["nostr"] as const,
  profiles: () => [...nostrQueryKeys.all, "profiles"] as const,
  profile: (pubkey: string) => [...nostrQueryKeys.profiles(), pubkey] as const,
  wallets: () => [...nostrQueryKeys.all, "wallets"] as const,
  wallet: (pubkey: string) => [...nostrQueryKeys.wallets(), pubkey] as const,
  links: () => [...nostrQueryKeys.all, "links"] as const,
  userLinks: (pubkey: string) => [...nostrQueryKeys.links(), pubkey] as const,
  themes: () => [...nostrQueryKeys.all, "themes"] as const,
  theme: (pubkey: string) => [...nostrQueryKeys.themes(), pubkey] as const,
} as const;

export function useProfile(pubkey: string) {
  const { queries, isConnected } = useNostr();

  return useQuery({
    queryKey: nostrQueryKeys.profile(pubkey),
    queryFn: () => {
      if (!queries) throw new Error("No queries available");
      return queries.getProfile(pubkey);
    },
    enabled: !!queries && !!pubkey && isConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLinks(pubkey: string) {
  const { queries, isConnected } = useNostr();

  return useQuery({
    queryKey: nostrQueryKeys.userLinks(pubkey),
    queryFn: () => {
      if (!queries) throw new Error("No queries available");
      return queries.getLinks(pubkey);
    },
    enabled: !!queries && !!pubkey && isConnected,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTheme(pubkey: string) {
  const { queries, isConnected } = useNostr();

  return useQuery({
    queryKey: nostrQueryKeys.theme(pubkey),
    queryFn: () => {
      if (!queries) throw new Error("No queries available");
      return queries.getTheme(pubkey);
    },
    enabled: !!queries && !!pubkey && isConnected,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfileAndLinks(pubkey: string) {
  const profileQuery = useProfile(pubkey);
  const linksQuery = useLinks(pubkey);

  return {
    profile: profileQuery.data,
    links: linksQuery.data ?? [],
    isLoading: profileQuery.isLoading || linksQuery.isLoading,
    isFetching: profileQuery.isFetching || linksQuery.isFetching,
    error: profileQuery.error ?? linksQuery.error,
    refetch: () => {
      void profileQuery.refetch();
      void linksQuery.refetch();
    },
  };
}

export function usePublishProfile() {
  const { queries } = useNostr();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: ProfileData) => {
      if (!queries) throw new Error("No queries available");
      return queries.publishProfile(profileData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: nostrQueryKeys.profiles(),
      });
    },
  });
}

export function usePublishLink() {
  const { queries } = useNostr();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkData: LinkData & { pubkey: string }) => {
      if (!queries) throw new Error("No queries available");
      return queries.publishLink(linkData);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: nostrQueryKeys.userLinks(variables.pubkey),
      });
    },
  });
}

export function usePublishTheme() {
  const { queries } = useNostr();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (themeData: ThemeData & { pubkey: string }) => {
      if (!queries) throw new Error("No queries available");
      return queries.publishTheme(themeData);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: nostrQueryKeys.theme(variables.pubkey),
      });
    },
  });
}

export function useCreateZapRequest() {
  const { queries } = useNostr();

  return useMutation({
    mutationFn: (zapData: ZapData) => {
      if (!queries) throw new Error("No queries available");
      return queries.createZapRequest(zapData);
    },
  });
}

export function useSendZap() {
  const { queries } = useNostr();

  return useMutation({
    mutationFn: ({
      lightningAddress,
      amount,
      zapRequest,
    }: {
      lightningAddress: string;
      amount: number;
      zapRequest: string;
    }) => {
      if (!queries) throw new Error("No queries available");
      return queries.sendZap(lightningAddress, amount, zapRequest);
    },
  });
}

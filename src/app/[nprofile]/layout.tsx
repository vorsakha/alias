"use client";

import { useTheme } from "@/lib/nostr/query-hooks";
import { ThemeProvider } from "@/components/theme-provider";
import { useParams } from "next/navigation";
import { decodeNProfile } from "@/lib/nostr/bech32";
import { useMemo } from "react";

export default function NProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { nprofile } = useParams();

  const pubkey = useMemo(() => {
    try {
      const decoded = decodeNProfile(nprofile as string);
      return decoded.pubkey;
    } catch {
      return "";
    }
  }, [nprofile]);

  const { data: theme } = useTheme(pubkey);

  return (
    <ThemeProvider themeId={theme?.themeOption} applyBackground={true}>
      {children}
    </ThemeProvider>
  );
}

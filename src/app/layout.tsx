import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Providers } from "@/components/providers";
import { NavigationDrawer } from "@/components/navigation-drawer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Nostr Links",
  description:
    "Decentralized profiles powered by Nostr - own your data, own your identity",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Providers>
          <NavigationDrawer />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}

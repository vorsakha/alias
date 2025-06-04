import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "@/env";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    signIn: async ({ user, account, profile }) => {
      if (account?.provider !== "discord") return true;

      try {
        if (!user.id) return true;

        const existingUser = await db.user.findUnique({
          where: { id: user.id },
          include: { creator: true },
        });

        if (existingUser && !existingUser.creator) {
          const emailPrefix = profile?.email?.split("@")[0];
          const username = emailPrefix ?? `user${user.id.substring(0, 8)}`;

          const creator = await db.creator.create({
            data: {
              username,
              displayName: user.name ?? username,
              avatarUrl: user.image,
              userId: user.id,
            },
          });

          await db.wallets.create({
            data: {
              creatorId: creator.id,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Allow sign-in even if creator profile creation fails
      }
    },
  },
} satisfies NextAuthConfig;

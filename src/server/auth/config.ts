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
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
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
      // Only proceed for Discord authentication
      if (account?.provider !== "discord") return true;

      try {
        // Make sure we have a user id
        if (!user.id) return true;

        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { id: user.id },
          include: { creator: true },
        });

        // If user exists but doesn't have a creator profile, create one
        if (existingUser && !existingUser.creator) {
          // Create a creator profile for the user
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

          // Create empty socials record
          await db.socials.create({
            data: {
              creatorId: creator.id,
            },
          });

          // Create empty wallets record
          await db.wallets.create({
            data: {
              creatorId: creator.id,
            },
          });
        }

        // If this is a new user, the PrismaAdapter will create the User record
        // We don't need to do anything special here as the adapter handles it

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true; // Allow sign-in even if creator profile creation fails
      }
    },
  },
} satisfies NextAuthConfig;

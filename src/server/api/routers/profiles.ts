import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .optional(),
  bio: z.string().optional().nullable(),
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

const profileCreateSchema = z.object({
  username: z
    .string()
    .min(6)
    .regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(2),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  lightningAddress: z.string().optional().nullable(),
  theme: z.string().optional(),
  xUsername: z.string().optional().nullable(),
  instagramUsername: z.string().optional().nullable(),
  githubUsername: z.string().optional().nullable(),
  facebookUsername: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  nostrPubkey: z.string().optional().nullable(),
});

export const profilesRouter = createTRPCRouter({
  // Check if current user has a profile
  hasProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) return false;

    const creator = await ctx.db.creator.findUnique({
      where: { userId },
      select: { id: true },
    });

    return !!creator;
  }),

  // Get current session info
  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  // Create a new profile
  createProfile: protectedProcedure
    .input(profileCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if username is already taken
      const existingUsername = await ctx.db.creator.findUnique({
        where: { username: input.username },
        select: { id: true },
      });

      if (existingUsername) {
        throw new Error("Username already taken");
      }

      // Check if user already has a profile
      const existingProfile = await ctx.db.creator.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (existingProfile) {
        throw new Error("User already has a profile");
      }

      // Create profile
      return ctx.db.creator.create({
        data: {
          username: input.username,
          displayName: input.displayName,
          bio: input.bio ?? null,
          avatarUrl: input.avatarUrl,
          lightningAddress: input.lightningAddress,
          theme: input.theme,
          xUsername: input.xUsername,
          instagramUsername: input.instagramUsername,
          githubUsername: input.githubUsername,
          facebookUsername: input.facebookUsername,
          email: input.email,
          nostrPubkey: input.nostrPubkey,
          userId,
        },
      });
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    const creators = await ctx.db.creator.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        websiteUrl: true,
        theme: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return creators;
  }),

  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const creator = await ctx.db.creator.findUnique({
        where: { username: input.username },
      });

      return creator;
    }),

  getCurrentCreator: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      throw new Error("Creator profile not found");
    }

    return creator;
  }),

  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find creator profile
      const creator = await ctx.db.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        throw new Error("Creator profile not found");
      }

      // Update profile
      return ctx.db.creator.update({
        where: { id: creator.id },
        data: {
          displayName: input.displayName,
          bio: input.bio,
          avatarUrl: input.avatarUrl,
          lightningAddress: input.lightningAddress,
          xUsername: input.xUsername,
          instagramUsername: input.instagramUsername,
          githubUsername: input.githubUsername,
          facebookUsername: input.facebookUsername,
          email: input.email,
          nostrPubkey: input.nostrPubkey,
        },
      });
    }),

  updateProfileExtras: protectedProcedure
    .input(
      z.object({
        websiteUrl: z.string().url().nullish(),
        theme: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const creator = await ctx.db.creator.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!creator) {
        throw new Error("Creator profile not found");
      }

      return ctx.db.creator.update({
        where: { id: creator.id },
        data: {
          websiteUrl: input.websiteUrl,
          theme: input.theme,
        },
      });
    }),
});

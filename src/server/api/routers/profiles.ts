import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { WalletType } from "@prisma/client";
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
  bitcoinAddress: z.string().optional().nullable(),
  ethereumAddress: z.string().optional().nullable(),
  solanaAddress: z.string().optional().nullable(),
  dogeAddress: z.string().optional().nullable(),
  moneroAddress: z.string().optional().nullable(),
  mainWallet: z.nativeEnum(WalletType).optional().nullable(),
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
});

const profileCreateSchema = z.object({
  username: z
    .string()
    .min(6)
    .regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(2),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  theme: z.string().optional(),
  lightningAddress: z.string().optional().nullable(),
  bitcoinAddress: z.string().optional().nullable(),
  ethereumAddress: z.string().optional().nullable(),
  solanaAddress: z.string().optional().nullable(),
  dogeAddress: z.string().optional().nullable(),
  moneroAddress: z.string().optional().nullable(),
  mainWallet: z.nativeEnum(WalletType).optional().nullable(),
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
});

export const profilesRouter = createTRPCRouter({
  hasProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) return false;

    const creator = await ctx.db.creator.findUnique({
      where: { userId },
      select: { id: true },
    });

    return !!creator;
  }),

  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  createProfile: protectedProcedure
    .input(profileCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existingUsername = await ctx.db.creator.findUnique({
        where: { username: input.username },
        select: { id: true },
      });

      if (existingUsername) {
        throw new Error("Username already taken");
      }

      const existingProfile = await ctx.db.creator.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (existingProfile) {
        throw new Error("User already has a profile");
      }

      const creator = await ctx.db.creator.create({
        data: {
          username: input.username,
          displayName: input.displayName,
          bio: input.bio ?? null,
          avatarUrl: input.avatarUrl,
          theme: input.theme,
          userId,
        },
      });

      await ctx.db.wallets.create({
        data: {
          creatorId: creator.id,
          lightningAddress: input.lightningAddress,
          bitcoinAddress: input.bitcoinAddress,
          ethereumAddress: input.ethereumAddress,
          solanaAddress: input.solanaAddress,
          dogeAddress: input.dogeAddress,
          moneroAddress: input.moneroAddress,
        },
      });

      if (Array.isArray(input.links)) {
        for (const [i, link] of input.links.entries()) {
          await ctx.db.link.create({
            data: {
              creatorId: creator.id,
              title: link.title,
              url: link.url,
              type: link.type || "link",
              description: link.description,
              imageUrl: link.imageUrl,
              icon: link.icon,
              siteName: link.siteName,
              author: link.author,
              canonical: link.canonical,
              themeColor: link.themeColor,
              publishedTime: link.publishedTime,
              modifiedTime: link.modifiedTime,
              videoUrl: link.videoUrl,
              audioUrl: link.audioUrl,
              album: link.album,
              artist: link.artist,
              genre: link.genre,
              releaseDate: link.releaseDate,
              imageWidth: link.imageWidth,
              imageHeight: link.imageHeight,
              isActive: link.isActive ?? true,
              position: i,
            },
          });
        }
      }

      return creator;
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    const creators = await ctx.db.creator.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
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
        include: {
          wallets: true,
          links: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      return creator ?? null;
    }),

  getCurrentCreator: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const creator = await ctx.db.creator.findUnique({
      where: { userId },
      include: {
        wallets: true,
        links: {
          orderBy: {
            position: "asc",
          },
        },
      },
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

      const creator = await ctx.db.creator.findUnique({
        where: { userId },
      });

      if (!creator) {
        throw new Error("Creator profile not found");
      }

      const updatedCreator = await ctx.db.creator.update({
        where: { id: creator.id },
        data: {
          displayName: input.displayName,
          bio: input.bio,
          avatarUrl: input.avatarUrl,
        },
      });

      await ctx.db.wallets.upsert({
        where: { creatorId: creator.id },
        create: {
          creatorId: creator.id,
          lightningAddress: input.lightningAddress,
          bitcoinAddress: input.bitcoinAddress,
          ethereumAddress: input.ethereumAddress,
          solanaAddress: input.solanaAddress,
          dogeAddress: input.dogeAddress,
          moneroAddress: input.moneroAddress,
          mainWallet: input.mainWallet,
        },
        update: {
          lightningAddress: input.lightningAddress,
          bitcoinAddress: input.bitcoinAddress,
          ethereumAddress: input.ethereumAddress,
          solanaAddress: input.solanaAddress,
          dogeAddress: input.dogeAddress,
          moneroAddress: input.moneroAddress,
          mainWallet: input.mainWallet,
        },
      });

      await ctx.db.link.deleteMany({
        where: { creatorId: creator.id },
      });

      if (Array.isArray(input.links)) {
        for (const [i, link] of input.links.entries()) {
          await ctx.db.link.create({
            data: {
              creatorId: creator.id,
              title: link.title,
              url: link.url,
              type: link.type || "link",
              description: link.description,
              imageUrl: link.imageUrl,
              icon: link.icon,
              siteName: link.siteName,
              author: link.author,
              canonical: link.canonical,
              themeColor: link.themeColor,
              publishedTime: link.publishedTime,
              modifiedTime: link.modifiedTime,
              videoUrl: link.videoUrl,
              audioUrl: link.audioUrl,
              album: link.album,
              artist: link.artist,
              genre: link.genre,
              releaseDate: link.releaseDate,
              imageWidth: link.imageWidth,
              imageHeight: link.imageHeight,
              isActive: link.isActive ?? true,
              position: i,
            },
          });
        }
      }

      const wallets = await ctx.db.wallets.findUnique({
        where: { creatorId: creator.id },
      });

      return {
        ...updatedCreator,
        wallets,
      };
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
          theme: input.theme,
        },
      });
    }),
});

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { auth } from "@/server/auth";

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Upload error:", err.message);
    console.log("  - Above error caused by:", err.cause);
    console.log("  - Above error stack:", err.stack);
    return { message: err.message };
  },
});

export const utapi = new UTApi();

/**
 * Extracts the file key from an UploadThing URL
 * @param url - The UploadThing URL
 * @returns The file key or null if not a valid UploadThing URL
 */
export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    if (
      !urlObj.hostname.includes("uploadthing") &&
      !urlObj.hostname.includes("utfs.io")
    ) {
      return null;
    }

    const pathParts = urlObj.pathname.split("/");
    const fileKey = pathParts[pathParts.length - 1];

    if (!fileKey || fileKey.length === 0) {
      return null;
    }

    return fileKey;
  } catch {
    return null;
  }
}

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file size", file.size);

      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

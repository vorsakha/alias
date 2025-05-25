import { createRouteHandler } from "uploadthing/next";
import { env } from "@/env";
import { ourFileRouter } from "@/server/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    logLevel: env.NODE_ENV === "development" ? "Debug" : "Info",
  },
});

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

const PUBLIC_PATHS = ["/api/", "/api/auth", "/", "/_next", "/favicon.ico"];

const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
};

const isProfilePage = (path: string): boolean => {
  const parts = path.split("/").filter(Boolean);
  return parts.length === 1;
};

export default async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProfilePage(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  try {
    const creator = await db.creator.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!creator && request.nextUrl.pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  } catch (error) {
    console.error("Error checking creator profile in middleware:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - Public paths defined above
     * - API routes
     * - Static files
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

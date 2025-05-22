import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

const PUBLIC_PATHS = ["/api/", "/api/auth", "/", "/_next", "/favicon.ico"];

// Check if path is public
const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
};

// Check if the path is a username profile page
const isProfilePage = (path: string): boolean => {
  const parts = path.split("/").filter(Boolean);
  return parts.length === 1;
};

export default async function middleware(request: NextRequest) {
  // Skip checking for public paths and static assets
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Get the user session
  const session = await auth();

  // If not logged in, redirect to login page
  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow access to profile pages once authenticated
  if (isProfilePage(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check if the user has a creator profile
  try {
    const creator = await db.creator.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    // If no creator profile and not already on the onboarding page, redirect to onboarding
    if (!creator && request.nextUrl.pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  } catch (error) {
    console.error("Error checking creator profile in middleware:", error);
  }

  return NextResponse.next();
}

export const config = {
  // Specify which paths this middleware should run for
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

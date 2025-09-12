import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/api/", "/", "/_next", "/favicon.ico"];

const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
};

export default async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
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

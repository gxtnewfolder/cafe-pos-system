import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define Auth Middleware
const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

import { NextFetchEvent } from "next/server";

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  // 1. Check for NEXT_LOCALE cookie
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  let locale = cookieLocale;

  if (!locale) {
    // Basic accept-language detection
    const acceptLanguage = req.headers.get("accept-language");
    locale = acceptLanguage?.includes("th") ? "th" : "en"; // Default logic
  }

  // 2. Run Auth Middleware
  // note: withAuth handles the logic based to matcher implicitly if used as default,
  // but here we call it manually.
  const authRes = await authMiddleware(req as any, event as any);

  // If auth middleware returns a response (redirect or rewrite), use it.
  // Otherwise, create a 'next' response.
  const response = (authRes as NextResponse) || NextResponse.next();

  // 3. Set Cookie if missing or changed (optional enforcement)
  // We only set if it was missing to avoid overwriting user preference
  if (!cookieLocale) {
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
}

export const config = {
  // Matcher for Auth
  // Note: We might want locale setting on ALL pages, not just protected ones.
  // But NextAuth matcher is mainly for protection.
  // The middleware function runs for all paths in matcher.
  // If we want locale on public pages, we should expand matcher or use separate config.
  // For now, let's keep user's matcher + login + root.
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/:path*", // Protect all API? original was specific.
    "/login", // Allow middleware to run on login to set locale? usually login is public.
    // Original matcher:
    // "/dashboard/:path*", "/api/dashboard/:path*", ...
  ],
};

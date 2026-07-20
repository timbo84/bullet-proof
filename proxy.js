import { NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { ROLE_PATH, roleHome } from "@/lib/roles";

const PUBLIC_AUTH_PATHS = ["/login", "/signup", "/reset-password"];
const ROLE_PREFIXES = Object.values(ROLE_PATH);
const AUTH_REQUIRED_PREFIXES = ["chat", "media-player", "workshop"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const firstSegment = pathname.split("/")[1];
  const isRolePath = ROLE_PREFIXES.includes(firstSegment);
  const isPublicAuthPath = PUBLIC_AUTH_PATHS.includes(pathname);
  const isRoot = pathname === "/";
  const needsAuth = isRolePath || isRoot || AUTH_REQUIRED_PREFIXES.includes(firstSegment);

  if (!session) {
    if (needsAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Logged in.
  const home = roleHome(session.role);

  if (isPublicAuthPath || isRoot) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (isRolePath && firstSegment !== ROLE_PATH[session.role]) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|webp|jpg|jpeg|ico)$).*)",
  ],
};

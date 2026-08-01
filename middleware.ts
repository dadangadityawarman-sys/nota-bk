import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/login") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("bk_auth")?.value;
  const correct = process.env.ADMIN_PASSWORD;

  if (!correct || cookie !== correct) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

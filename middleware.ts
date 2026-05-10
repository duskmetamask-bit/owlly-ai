import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^]*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)).*)",
  ],
};
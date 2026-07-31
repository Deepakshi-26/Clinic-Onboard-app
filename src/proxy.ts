import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/hr") && role !== "HR") {
    return NextResponse.redirect(new URL("/employee", req.url));
  }
  if (pathname.startsWith("/employee") && role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL("/hr", req.url));
  }
});

export const config = {
  matcher: ["/hr/:path*", "/employee/:path*"],
};

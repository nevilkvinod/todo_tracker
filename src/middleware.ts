import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname === "/" || pathname === "/dashboard") {
      if (token?.role === "MANAGER") {
        return NextResponse.redirect(new URL("/manager", req.url));
      } else {
        return NextResponse.redirect(new URL("/board", req.url));
      }
    }

    if (pathname.startsWith("/manager") && token?.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/board", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard", "/dashboard/:path*", "/board/:path*", "/timeline/:path*", "/manager/:path*", "/calendar/:path*"],
};

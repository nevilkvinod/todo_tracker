import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

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

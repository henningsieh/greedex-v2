import type { NextRequest, NextResponse } from "next/server";

import { createMiddleware } from "@greendex/i18n/server";

import { routing } from "./lib/i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const segments = pathname.split("/");
  const isOrgRoute = segments.length > 2 && segments[2] === "org";
  const isAcceptInvitationRoute =
    segments.length > 2 && segments[2] === "accept-invitation";

  // console.debug(
  //   `Proxy middleware: isOrgRoute=${isOrgRoute}, isAcceptInvitationRoute=${isAcceptInvitationRoute}, pathname=${pathname}, search=${search}`,
  // );

  // For org-related and accept-invitation routes, store the originally requested path in a custom header

  if (isOrgRoute || isAcceptInvitationRoute) {
    request.headers.set("x-org-requested-path", `${pathname}${search}`);
  }

  return nextIntlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

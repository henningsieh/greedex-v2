import type { NextRequest, NextResponse } from "next/server";

import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

const nextIntlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const segments = pathname.split("/");
  const isOrgRoute = segments.length > 2 && segments[2] === "org";

  if (isOrgRoute) {
    request.headers.set("x-org-requested-path", `${pathname}${search}`);
  }

  return nextIntlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

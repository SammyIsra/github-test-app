import { NextRequest, NextResponse } from 'next/server';
import { getRequestOrigin } from "@/app/util/url";

/**
 * API to log out the user by clearing the GitHub token cookie.
 * @param request
 * @returns Redirect response to the home page.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/", getRequestOrigin(request, process.env.NODE_ENV))
  );
  response.cookies.delete("github_token");

  return response;
}
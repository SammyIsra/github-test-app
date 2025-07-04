import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/util/octokit';

/**
 * Callback from OAuth flow to handle GitHub OAuth response.
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  let baseUrl: string;

  if (process.env.NODE_ENV === "production") {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const hostHeader = request.headers.get("host");
    const host = forwardedHost || hostHeader;
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    baseUrl = `${protocol}://${host}`;
  } else {
    baseUrl = new URL(request.url).origin;
  }

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  // Handle missing code
  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", baseUrl));
  }

  try {
    // Exchange code for access token
    const redirectUri = new URL("/api/auth/callback", baseUrl).toString();
    const accessToken = await exchangeCodeForToken(code, redirectUri);

    // Create response and set secure cookie
    const response = NextResponse.redirect(new URL("/", baseUrl));

    // Set httpOnly cookie for security
    response.cookies.set("github_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);

    const errorMsg = encodeURIComponent(
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.redirect(
      `${baseUrl}/?error=token_exchange_failed&details=${errorMsg}`
    );
  }
}

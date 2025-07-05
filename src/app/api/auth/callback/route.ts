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

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Handle missing code
  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=missing_code', request.url)
    );
  }

  try {
    // Exchange code for access token
    const redirectUri = new URL('/api/auth/callback', request.url).toString();
    const accessToken = await exchangeCodeForToken(code, redirectUri);

    // Create response and set secure cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set httpOnly cookie for security
    response.cookies.set('github_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/?error=token_exchange_failed&url=&${encodeURI(
          request.url
        )}&clientId=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
        request.url
      )
    );
  }
}

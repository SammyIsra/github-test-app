import { NextRequest, NextResponse } from 'next/server';

/**
 * API to log out the user by clearing the GitHub token cookie.
 * @param request 
 * @returns Redirect response to the home page.
 */
export async function GET(request: NextRequest) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete('github_token');

    return response;
}
import { Octokit } from "octokit";
import type { Endpoints } from "@octokit/types";

// GitHub App configuration
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;

// Type definitions using official Octokit types
export type UserRepositories = Endpoints["GET /user/repos"]["response"]["data"];
export type UserInfo = Endpoints["GET /user"]["response"]["data"];

// Generate GitHub App authorization URL for user authentication
export function getAuthorizationUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    state: state || Math.random().toString(36).substring(7),
    // Add scope to request access to private repositories
    scope: 'repo',
  });
  
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// Exchange OAuth code for access token
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OAuth error: ${data.error_description || data.error}`);
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

// Generate GitHub App installation URL
export function getInstallationUrl(): string {
  return `https://github.com/apps/sammy-app-tests/installations/new`;
}

// Get authenticated user's repositories
export async function getRepoList(accessToken: string): Promise<UserRepositories> {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    });

    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 30,
      affiliation: 'owner,collaborator,organization_member',
    });

    // Debug logging for GitHub App limitations
    console.log(`Found ${data.length} repositories`);
    console.log('Private repos:', data.filter(repo => repo.private).length);
    console.log('Public repos:', data.filter(repo => !repo.private).length);
    
    // Note: Private repositories will only appear if the GitHub App is installed
    // on those repositories by the user
    
    return data;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
}

// Get authenticated user info
export async function getUserInfo(accessToken: string): Promise<UserInfo> {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    });

    const { data } = await octokit.rest.users.getAuthenticated();
    return data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}
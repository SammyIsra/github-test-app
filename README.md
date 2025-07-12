# GitHub Repository Viewer

A Next.js web application that allows users to authenticate with GitHub and view their repositories. 

Project to find out how GitHub authentication works, and workflows to deploy to different clouds.

Currently this project is hosted at:
- Azure: https://polite-sea-088756010.2.azurestaticapps.net/
- Netlify: https://view-my-repos.netlify.app/
  - Much better URL selection imo 

## Features

- GitHub OAuth authentication
- Display user's repositories with details
- Repository information including stars, language, privacy status
- Responsive design with Tailwind CSS
- Secure token handling with HTTP-only cookies

## Setup Instructions

### 1. Create a GitHub App (Recommended) or OAuth App

#### For GitHub App (Better for Private Repo Access):
1. Go to [GitHub Settings > Developer settings > GitHub Apps](https://github.com/settings/apps/new)
2. Fill in the application details:
   - **GitHub App name**: Your app name (note this for step 3)
   - **Homepage URL**: `http://localhost:3000`
   - **User authorization callback URL**: `http://localhost:3000/api/auth/callback`
   - **Repository permissions**: 
     - Contents: Read
     - Metadata: Read
3. Click "Create GitHub App"
4. Copy the **Client ID** and generate a **Client Secret**

#### Alternative - OAuth App:
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Follow similar steps as above

### 2. Update Installation URL

In `src/app/util/octokit.ts`, replace `'your-app-name'` with your actual GitHub App name:
```typescript
export function getInstallationUrl(): string {
  return `https://github.com/apps/YOUR_ACTUAL_APP_NAME/installations/new`;
}
```

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your GitHub OAuth App credentials:
   ```env
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

1. **Authentication Flow**:
   - User clicks "Login with GitHub"
   - Redirected to GitHub OAuth authorization
   - GitHub redirects back with authorization code
   - Server exchanges code for access token
   - Token stored in secure HTTP-only cookie

2. **Repository Fetching**:
   - Authenticated requests to GitHub API
   - Displays repositories with metadata
   - Real-time updates and refresh functionality

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/callback/     # OAuth callback handler
│   │   └── repos/             # Repository API endpoint
│   ├── util/
│   │   └── octokit.ts         # GitHub API utilities
│   ├── layout.tsx
│   └── page.tsx               # Main application component
└── ...
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Octokit** - GitHub API client
- **GitHub OAuth** - Authentication

## Security Features

- HTTP-only cookies for token storage
- Secure cookie settings for production
- Environment variable protection
- CSRF protection via state parameter

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

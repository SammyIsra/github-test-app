"use client";

import React, { useState, useEffect } from "react";
import { getAuthorizationUrl, getInstallationUrl } from "./util/octokit";
import type { Endpoints } from "@octokit/types";

// Use official Octokit types for repository data
type Repository = Endpoints["GET /user/repos"]["response"]["data"][0];

export default function Home() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/repos");

      if (response.status === 401) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }

      const data = await response.json();
      setRepos(data.repos);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const authUrl = getAuthorizationUrl(redirectUri);
    window.location.assign(authUrl);
  };

  const handleInstallApp = () => {
    const installUrl = getInstallationUrl();
    window.open(installUrl, "_blank");
  };

  const logout = async () => {
    await fetch("/api/auth/logout");
    setIsAuthenticated(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              GitHub Repository Viewer
            </h1>
            <p className="text-gray-600 mb-6">
              Connect your GitHub account to view your repositories
            </p>

            {/* Step 1: Authorization */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Step 1: Authorize Access
              </h3>
              <button
                onClick={handleLogin}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Login with GitHub
              </button>
            </div>

            {/* Step 2: Installation */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Step 2: Install App (For Private Repos)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                To access your private repositories, install our GitHub App on
                the repositories you want to view.
              </p>
              <button
                onClick={handleInstallApp}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Install GitHub App
              </button>
            </div>

            <div className="text-xs text-gray-500">
              <p>
                📝 You can skip Step 2 if you only need to view public
                repositories
              </p>
            </div>

            {error && (
              <div className="mt-4 text-red-600 text-sm">Error: {error}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Repositories
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleInstallApp}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Install on More Repos
            </button>
            <button
              onClick={fetchRepos}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* GitHub App Installation Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">Missing Private Repositories?</p>
              <p className="text-sm mt-1">
                This GitHub App can only access private repositories that
                you&apos;ve installed it on. Click &quot;Install on More
                Repos&quot; to grant access to additional repositories.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {repo.name}
                </h3>
                {repo.private && (
                  <span
                    className="text-s px-2 py-1 rounded"
                    title="This repo is private"
                  >
                    🔒
                  </span>
                )}
                {repo.archived && (
                  <span
                    className="text-s px-2 py-1 rounded"
                    title="This repo is archived"
                  >
                    🗄️
                  </span>
                )}
              </div>

              {repo.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                {repo.language && (
                  <span className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {repo.stargazers_count}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Updated{" "}
                  {repo.updated_at
                    ? new Date(repo.updated_at).toLocaleDateString()
                    : "N/A"}
                </span>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          ))}
        </div>

        {repos.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No repositories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

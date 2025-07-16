import { NextRequest } from "next/server";

/**
 * Gets the base URL.
 * Azure's Static Web App hosts the app in a container and all requests to it pass thru a proxy? so it looks like all requests are made to localhost:8080.
 * This can cause issues when trying to redirect requests (auth, logout, etc)
 *
 * @param env Current environment. Usually from `process.env.NODE_ENV`
 * @returns corrected URL object
 */
export function getRequestOrigin(
  request: NextRequest,
  env: typeof process.env.NODE_ENV
): string {
  if (
    env === "production" &&
    (request.headers.has("x-forwarded-host") || request.headers.has("host"))
  ) {
    const host =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return `${protocol}://${host}`;
  } else {
    return new URL(request.url).origin;
  }
}

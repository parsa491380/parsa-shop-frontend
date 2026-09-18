/**
 * Central API client for our Django backend.
 *
 * IMPORTANT:
 *
 * React components should NOT repeatedly contain code such as:
 *
 *     fetch("/api/products/")
 *
 * with authentication/CSRF logic duplicated everywhere.
 *
 * Instead, everything should eventually go through this file.
 */


// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}


// ---------------------------------------------------------
// Read a browser cookie
// ---------------------------------------------------------

function getCookie(name: string): string | null {
  /**
   * document.cookie contains values such as:
   *
   *     csrftoken=abc123; other=value
   *
   * Django's CSRF middleware uses the csrftoken cookie.
   */

  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}


// ---------------------------------------------------------
// Ensure CSRF exists
// ---------------------------------------------------------

export async function ensureCsrfToken(): Promise<void> {
  /**
   * Before submitting a POST/PUT/PATCH/DELETE request,
   * Django expects a CSRF token.
   *
   * We ask Django for it once.
   */

  await fetch("/api/auth/csrf/", {
    method: "GET",

    credentials: "include",
  });
}


// ---------------------------------------------------------
// Generic API request
// ---------------------------------------------------------

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {

  const method = (
    options.method ?? "GET"
  ).toUpperCase();

  const headers = new Headers(
    options.headers,
  );


  // JSON requests should tell Django what we are sending.
  if (options.body && !headers.has("Content-Type")) {

    headers.set(
      "Content-Type",
      "application/json",
    );
  }


  // Unsafe HTTP methods require CSRF.
  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    method === "DELETE"
  ) {

    const csrfToken = getCookie(
      "csrftoken",
    );

    if (csrfToken) {

      headers.set(
        "X-CSRFToken",
        csrfToken,
      );
    }
  }


  const response = await fetch(
    path,
    {
      ...options,

      headers,

      // Send Django's session cookie.
      credentials: "include",

      cache: "no-store",
    },
  );


  // Attempt to parse JSON.
  const data = await response.json().catch(
    () => null,
  );


  if (!response.ok) {

    const error: ApiError = (
      data ?? {
        detail: "Something went wrong.",
      }
    );

    throw new Error(
      typeof error.detail === "string"
        ? error.detail
        : "API request failed.",
    );
  }

  return data as T;
}
/**
 * Low-level HTTP client used by the storefront.
 *
 * Browser requests stay same-origin:
 *     /api/...
 *
 * Next.js proxies those requests to Django on the server side.
 * This keeps Django's internal host/port out of browser code.
 */

function getCookie(name: string): string | null {
  // document does not exist during server rendering.
  // Therefore this function only reads cookies in the browser.
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");

  for (const rawCookie of cookies) {
    const [key, ...rest] = rawCookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

//  Return Django's CSRF token.
//  We only need this for requests that modify data:
//  POST
//  PUT
//  PATCH
//  DELETE
async function ensureCsrfToken(): Promise<string | null> {
  const response = await fetch("/api/auth/csrf/", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to initialize CSRF protection.");
  }

  return getCookie("csrftoken");
}

// Build the actual URL.
// Browser:
//     /api/products/
// is enough because Next.js rewrites it to Django.
// Server:
//     fetch("/api/products/")
// is not always valid because server-side fetch needs an
// absolute URL.
// So server-side rendering uses DJANGO_INTERNAL_URL.
function buildServerUrl(path: string): string {
  if (typeof window === "undefined") {
    const djangoInternalUrl = process.env.DJANGO_INTERNAL_URL;

    if (djangoInternalUrl) {
      return `${djangoInternalUrl}${path}`;
    }
  }

  // Browser requests stay same-origin.
  return path;
}

// Main API function.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  // JSON requests.
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Unsafe methods require CSRF protection.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    let csrfToken = getCookie("csrftoken");

    // If we don't already have a token, ask Django
    // to create one.
    if (!csrfToken) {
      csrfToken = await ensureCsrfToken();
    }

    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
  }

  const response = await fetch(buildServerUrl(path), {
    ...options,
    method,
    headers,
    // Send Django's session cookie.
    credentials: "include",
  });

  // Try to parse JSON.
  const data = await response.json().catch(() => null);

  // Convert HTTP errors into JavaScript errors.

  if (!response.ok) {
    const detail =
      data && typeof data.detail === "string"
        ? data.detail
        : `API request failed (${response.status}).`;

    throw new Error(detail);
  }

  return data as T;
}

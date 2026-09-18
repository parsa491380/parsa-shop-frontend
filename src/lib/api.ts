/**
 * =========================================================
 * Generic API client
 * =========================================================
 *
 * This is the single low-level HTTP layer used by our shop.
 *
 * The important rule is:
 *
 * React components
 *       ↓
 * store-api.ts
 *       ↓
 * api.ts
 *       ↓
 * Django
 *
 * Components should not contain their own Django URLs,
 * CSRF logic, error parsing, etc.
 */

function getCookie(name: string): string | null {
  /**
   * document does not exist during server rendering.
   *
   * Therefore this function only reads cookies in the browser.
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


/**
 * Return Django's CSRF token.
 *
 * We only need this for requests that modify data:
 *
 * POST
 * PUT
 * PATCH
 * DELETE
 */
async function ensureCsrfToken(): Promise<string | null> {
  const response = await fetch(
    "/api/auth/csrf/",
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Unable to initialize CSRF protection.",
    );
  }

  return getCookie("csrftoken");
}


/**
 * Build the actual URL.
 *
 * Browser:
 *
 *     /api/products/
 *
 * is enough because Next.js rewrites it to Django.
 *
 * Server:
 *
 *     fetch("/api/products/")
 *
 * is not always valid because server-side fetch needs an
 * absolute URL.
 *
 * So server-side rendering uses DJANGO_INTERNAL_URL.
 */
function buildApiUrl(path: string): string {
  const djangoInternalUrl =
    process.env.DJANGO_INTERNAL_URL;

  /**
   * We are running in Node/Next.js server code.
   */
  if (
    typeof window === "undefined" &&
    djangoInternalUrl
  ) {
    return `${djangoInternalUrl}${path}`;
  }

  /**
   * Browser requests stay same-origin.
   */
  return path;
}


/**
 * Main API function.
 */
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


  /**
   * JSON requests.
   */
  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }


  /**
   * Unsafe methods require CSRF protection.
   */
  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH" ||
    method === "DELETE"
  ) {

    let csrfToken = getCookie(
      "csrftoken",
    );

    /**
     * If we don't already have a token, ask Django
     * to create one.
     */
    if (!csrfToken) {
      csrfToken = await ensureCsrfToken();
    }

    if (csrfToken) {
      headers.set(
        "X-CSRFToken",
        csrfToken,
      );
    }
  }


  const response = await fetch(
    buildApiUrl(path),
    {
      ...options,

      headers,

      /**
       * Send Django's session cookie.
       */
      credentials: "include",
    },
  );


  /**
   * Try to parse JSON.
   */
  const data = await response
    .json()
    .catch(() => null);


  /**
   * Convert HTTP errors into JavaScript errors.
   */
  if (!response.ok) {

    const message =
      data &&
      typeof data.detail === "string"
        ? data.detail
        : `API request failed: ${response.status}`;

    throw new Error(message);
  }


  return data as T;
}
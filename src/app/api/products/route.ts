/**
 * =========================================================
 * Next.js -> Django Product Proxy
 * =========================================================
 *
 * Browser:
 *
 *     GET /api/products/
 *
 *        ↓
 *
 * Next.js Route Handler
 *
 *        ↓
 *
 * Django:
 *
 *     GET http://127.0.0.1:8000/api/products/
 *
 *        ↓
 *
 * Django Oscar
 *
 *        ↓
 *
 * JSON response
 *
 * This keeps Django hidden from the browser.
 */

const DJANGO_URL = "http://127.0.0.1:8000";

export async function GET() {
  try {
    /**
     * Ask Django for the products.
     *
     * cache: "no-store" is useful while developing because
     * we always want the newest catalogue data.
     */
    const response = await fetch(`${DJANGO_URL}/api/products/`, {
      method: "GET",

      cache: "no-store",

      headers: {
        Accept: "application/json",
      },
    });

    /**
     * Return Django's response to the browser.
     */
    return new Response(response.body, {
      status: response.status,

      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    /**
     * This means Next.js could not connect to Django.
     */
    console.error("Django products proxy error:", error);

    return Response.json(
      {
        detail: "Unable to connect to Django.",
      },
      {
        status: 502,
      },
    );
  }
}

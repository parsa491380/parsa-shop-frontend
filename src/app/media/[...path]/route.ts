/**
 * =========================================================
 * Django Media Proxy
 * =========================================================
 *
 * Browser:
 *
 *     /media/images/shoe.jpg
 *
 *        ↓
 *
 * Next.js
 *
 *        ↓
 *
 * Django:
 *
 *     http://127.0.0.1:8000/media/images/shoe.jpg
 *
 * This allows the browser to use the same-origin URL while
 * Django remains responsible for storing the actual files.
 */

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? "http://127.0.0.1:8000";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  try {
    const { path } = await context.params;

    /**
     * Rebuild the Django media path.
     *
     * Example:
     *
     * ["images", "shoe.jpg"]
     *
     * becomes:
     *
     * /media/images/shoe.jpg
     */
    const mediaPath = path.map((part) => encodeURIComponent(part)).join("/");

    const djangoResponse = await fetch(`${DJANGO_URL}/media/${mediaPath}`, {
      method: "GET",
      cache: "no-store",
    });

    /**
     * Django couldn't find the file.
     */
    if (!djangoResponse.ok) {
      return new Response("Media file not found.", {
        status: djangoResponse.status,
      });
    }

    /**
     * Pass Django's image/file response back to
     * the browser.
     */
    const headers = new Headers();

    const contentType = djangoResponse.headers.get("content-type");

    if (contentType) {
      headers.set("content-type", contentType);
    }

    const contentLength = djangoResponse.headers.get("content-length");

    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    return new Response(djangoResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Django media proxy error:", error);

    return new Response("Unable to load media.", {
      status: 502,
    });
  }
}

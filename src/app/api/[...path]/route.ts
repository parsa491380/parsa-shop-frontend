/**
 * Generic same-origin proxy from Next.js to Django.
 *
 * Browser:
 *     /api/...
 *
 * Server:
 *     http://127.0.0.1:8000/api/...
 *
 * The route deliberately forwards cookies and the CSRF header because
 * Django owns authentication and session state.
 */

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? "http://127.0.0.1:8000";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "content-type",
  "cookie",
  "x-csrftoken",
  "origin",
  "referer",
];

const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
  "location",
  "vary",
  "expires",
];

async function handleRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const pathName = path.map((part) => encodeURIComponent(part)).join("/");
  const incomingUrl = new URL(request.url);
  const target = `${DJANGO_URL}/api/${pathName}${incomingUrl.search}`;

  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const method = request.method.toUpperCase();

  const body = ["GET", "HEAD"].includes(method) ? undefined : await request.arrayBuffer();

  try {
    const djangoResponse = await fetch(target, {
      method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers();

    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = djangoResponse.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    // Node's fetch implementation may expose multiple Set-Cookie headers
    // through getSetCookie(). Forward them individually when available.
    const getSetCookie = (
      djangoResponse.headers as Headers & {
        getSetCookie?: () => string[];
      }
    ).getSetCookie;

    if (typeof getSetCookie === "function") {
      for (const cookie of getSetCookie.call(djangoResponse.headers)) {
        responseHeaders.append("set-cookie", cookie);
      }
    } else {
      const cookie = djangoResponse.headers.get("set-cookie");
      if (cookie) responseHeaders.set("set-cookie", cookie);
    }

    return new Response(djangoResponse.body, {
      status: djangoResponse.status,
      statusText: djangoResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Django API proxy error:", error);

    return Response.json(
      { detail: "The storefront could not connect to the backend." },
      { status: 502 },
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRequest(request, context);
}

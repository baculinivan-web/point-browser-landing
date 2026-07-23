const contentTypes = {
  ".css": "text/css; charset=UTF-8",
  ".html": "text/html; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const assetUrl = new URL(path, request.url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));

    if (response.status !== 404) {
      const headers = new Headers(response.headers);
      const extension = path.slice(path.lastIndexOf(".")).toLowerCase();
      if (contentTypes[extension] && !headers.has("content-type")) {
        headers.set("content-type", contentTypes[extension]);
      }
      return new Response(response.body, { status: response.status, headers });
    }

    const fallback = await env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    return new Response(fallback.body, {
      status: fallback.status,
      headers: fallback.headers,
    });
  },
};

export default worker;

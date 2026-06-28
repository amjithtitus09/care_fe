// Zero-dependency static + reverse-proxy server for the gh-aw Visual QA workflow.
//
// It serves the built care_fe SPA (history fallback to index.html) on a single
// port AND reverse-proxies the API paths to the care backend running on the same
// runner. Because the browser only ever talks to one origin (the QA port), the
// SPA's API calls are same-origin — no CORS, and the sandboxed agent browser only
// needs the single firewall-allowed port (80) to reach both the UI and the API.
//
// Configuration (all optional, via env):
//   QA_BUILD_DIR     directory of the built SPA            (default: ./build)
//   QA_PORT          port to listen on                     (default: 80)
//   QA_BACKEND_HOST  backend host to proxy API calls to    (default: 127.0.0.1)
//   QA_BACKEND_PORT  backend port to proxy API calls to    (default: 9000)
//
// No secrets are handled here; it only forwards bytes between the browser and the
// already-running local backend.

const http = require("http");
const fs = require("fs");
const path = require("path");

const BUILD = path.resolve(process.env.QA_BUILD_DIR || "build");
const PORT = parseInt(process.env.QA_PORT || "80", 10);
const BK = {
  host: process.env.QA_BACKEND_HOST || "127.0.0.1",
  port: parseInt(process.env.QA_BACKEND_PORT || "9000", 10),
};

// Anything under these prefixes is proxied to the backend; everything else is a
// static asset or an SPA route.
const PROXY_PREFIXES = ["/api", "/ws", "/static", "/media"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

function isProxied(url) {
  return PROXY_PREFIXES.some(
    (p) => url === p || url.startsWith(p + "/") || url.startsWith(p + "?"),
  );
}

function proxy(req, res) {
  const opts = {
    host: BK.host,
    port: BK.port,
    method: req.method,
    path: req.url,
    // Rewrite Host so Django's ALLOWED_HOSTS accepts the forwarded request
    // (the browser's Host is the QA origin, which the backend doesn't know).
    headers: { ...req.headers, host: BK.host + ":" + BK.port },
  };
  const upstream = http.request(opts, (r) => {
    res.writeHead(r.statusCode || 502, r.headers);
    r.pipe(res);
  });
  upstream.on("error", () => {
    if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" });
    res.end("backend proxy error");
  });
  req.pipe(upstream);
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("not found");
    }
    res.writeHead(200, {
      "content-type": MIME[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(buf);
  });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const filePath = path.join(BUILD, urlPath);
  // Guard against path traversal outside the build dir.
  if (!filePath.startsWith(BUILD)) {
    res.writeHead(403, { "content-type": "text/plain" });
    return res.end("forbidden");
  }
  fs.stat(filePath, (err, st) => {
    if (!err && st.isFile()) return sendFile(filePath, res);
    // SPA history fallback.
    sendFile(path.join(BUILD, "index.html"), res);
  });
}

const server = http.createServer((req, res) => {
  if (isProxied(req.url || "/")) return proxy(req, res);
  serveStatic(req, res);
});

// Best-effort WebSocket upgrade proxying (some flows open a socket).
server.on("upgrade", (req, socket, head) => {
  if (!isProxied(req.url || "/")) return socket.destroy();
  const opts = {
    host: BK.host,
    port: BK.port,
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: BK.host + ":" + BK.port },
  };
  const upstream = http.request(opts);
  upstream.on("upgrade", (upRes, upSocket, upHead) => {
    const head2 =
      "HTTP/1.1 101 Switching Protocols\r\n" +
      Object.entries(upRes.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n") +
      "\r\n\r\n";
    socket.write(head2);
    if (upHead && upHead.length) upSocket.unshift(upHead);
    upSocket.pipe(socket);
    socket.pipe(upSocket);
  });
  upstream.on("error", () => socket.destroy());
  if (head && head.length) upstream.write(head);
  upstream.end();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[qa-preview-server] serving ${BUILD} on :${PORT}, proxying ${PROXY_PREFIXES.join(
      ",",
    )} -> ${BK.host}:${BK.port}`,
  );
});

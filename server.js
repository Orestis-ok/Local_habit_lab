const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5177);
const host = "127.0.0.1";

const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(request.url === "/" ? "/index.html" : request.url);
  const filePath = path.normalize(path.join(root, urlPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, body) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(body);
  });
});

server.listen(port, host, () => {
  console.log(`Local Habit Lab running at http://${host}:${port}/`);
});

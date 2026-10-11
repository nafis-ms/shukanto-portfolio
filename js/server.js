/* Feedback server. No packages needed. Run:  ADMIN_PASSWORD=yourpassword node server.js
   Serves the site, saves feedback to feedback.json, and powers admin.html. */
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = __dirname, DB = path.join(ROOT, "feedback.json");
const PORT = process.env.PORT || 3000, KEY = process.env.ADMIN_PASSWORD || "admin";
if (!process.env.ADMIN_PASSWORD) console.log("! Using the default admin password \"admin\". Set ADMIN_PASSWORD before going live.");

let list = [];
try { list = JSON.parse(fs.readFileSync(DB, "utf8")); } catch (e) {}
const save = () => fs.writeFileSync(DB, JSON.stringify(list, null, 2));

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm", ".ico": "image/x-icon", ".woff2": "font/woff2" };
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
const readBody = req => new Promise(ok => {
  let d = "";
  req.on("data", c => { d += c; if (d.length > 10000) req.destroy(); });
  req.on("end", () => { try { ok(JSON.parse(d)); } catch (e) { ok(null); } });
});
const isAdmin = req => {
  const a = Buffer.from(String(req.headers["x-admin-key"] || "")), b = Buffer.from(KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const lastPost = {};

http.createServer(async (req, res) => {
  const p = new URL(req.url, "http://x").pathname, q = new URL(req.url, "http://x").searchParams;

  /* public: submit + read approved */
  if (p === "/api/feedback") {
    if (req.method === "GET") {
      const out = list.filter(f => f.status === "approved").sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(f => f.anonymous ? { message: f.message, date: f.createdAt, anonymous: true }   /* real name never leaves the server */
                              : { message: f.message, date: f.createdAt, anonymous: false, name: f.name });
      return send(res, 200, out);
    }
    if (req.method === "POST") {
      const ip = req.socket.remoteAddress, now = Date.now();
      if (lastPost[ip] && now - lastPost[ip] < 20000) return send(res, 429, { error: "Please wait a moment." });
      const b = await readBody(req);
      const name = b && typeof b.name === "string" ? b.name.trim() : "", message = b && typeof b.message === "string" ? b.message.trim() : "";
      if (!name || name.length > 60 || message.length < 10 || message.length > 500) return send(res, 400, { error: "Invalid input." });
      lastPost[ip] = now;
      list.push({ id: now.toString(36) + crypto.randomBytes(3).toString("hex"), name, anonymous: b.anonymous === true, message, createdAt: new Date().toISOString(), status: "pending" });
      save();
      return send(res, 201, { ok: true });
    }
  }

  /* admin: list all, approve / reject / delete */
  if (p.startsWith("/api/admin/feedback")) {
    if (!isAdmin(req)) return send(res, 401, { error: "Wrong password." });
    if (p === "/api/admin/feedback" && req.method === "GET") {
      const s = q.get("status");
      return send(res, 200, list.filter(f => !s || f.status === s).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }
    const id = p.split("/")[4], item = list.find(f => f.id === id);
    if (!item) return send(res, 404, { error: "Not found." });
    if (req.method === "POST") {
      const b = await readBody(req);
      if (!b || !["pending", "approved", "rejected"].includes(b.status)) return send(res, 400, { error: "Invalid status." });
      item.status = b.status; save();
      return send(res, 200, item);
    }
    if (req.method === "DELETE") { list = list.filter(f => f.id !== id); save(); return send(res, 200, { ok: true }); }
  }

  /* static files (never the server or the data file) */
  let f = p === "/" ? "/index.html" : p === "/admin" ? "/admin.html" : decodeURIComponent(p);
  const file = path.join(ROOT, path.normalize(f)), base = path.basename(file);
  if (!file.startsWith(ROOT + path.sep) || base.startsWith(".") || ["server.js", "feedback.json"].includes(base) || file.includes("node_modules") || !MIME[path.extname(file)]) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] }); res.end(data);
  });
}).listen(PORT, () => console.log("Site: http://localhost:" + PORT + "   Admin: http://localhost:" + PORT + "/admin"));
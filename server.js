/* Site + admin server. No packages needed. Run:  ADMIN_PASSWORD=yourpassword node server.js
   Serves the site, stores site content in content.json, feedback in feedback.json,
   project pictures in uploads/, and powers /admin. */
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = __dirname, DB = path.join(ROOT, "feedback.json"), CDB = path.join(ROOT, "content.json"), UP = path.join(ROOT, "uploads");
const PORT = process.env.PORT || 3000, KEY = process.env.ADMIN_PASSWORD || "admin";
if (!process.env.ADMIN_PASSWORD) console.log("! Using the default admin password \"admin\". Set ADMIN_PASSWORD before going live.");
fs.mkdirSync(UP, { recursive: true });

/* ---------- stored data ---------- */
const DEFAULTS = {
  about: {
    heading: "The edit is where the story gets decided.",
    paragraphs: [
      "I'm Shukanto Shishir, a motion designer and video editor based in Dhaka, Bangladesh. I take the footage and ideas you already have and shape them into something that moves: clear pacing, clean transitions and graphics that belong in the frame.",
      "Away from the timeline I'm studying engineering, and I like music, travel and games. All of it feeds how I think about rhythm and detail."
    ],
    email: "shukanto99@gmail.com", phone: "+880 1XXX-XXXXXX", address: "Dhaka, Bangladesh"
  },
  services: [
    { id: "s1", title: "Video editing", desc: "Narrative, commercial and social cuts, paced to the story and the soundtrack.", icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 11h18M7 7l3-4M13 7l3-4"/>' },
    { id: "s2", title: "Motion graphics", desc: "Titles, kinetic type, logo animation and explainers.", icon: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>' },
    { id: "s3", title: "Color and sound", desc: "Grading, audio cleanup and mixing so the picture and sound match.", icon: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>' },
    { id: "s4", title: "Short-form", desc: "Vertical edits and reels built for the first second of the scroll.", icon: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>' }
  ],
  qualification: {
    skills: ["Adobe Photoshop", "Microsoft Word", "Microsoft Excel", "Data analysis", "Email"],
    languages: "Bengali (excellent) and English (good).",
    interests: "Music, travel, games and always learning."
  },
  contactEmail: "shukanto99@gmail.com",
  projects: []
};
let content = JSON.parse(JSON.stringify(DEFAULTS));
try { const c = JSON.parse(fs.readFileSync(CDB, "utf8")); for (const k in c) content[k] = c[k]; } catch (e) {}
const saveC = () => fs.writeFileSync(CDB, JSON.stringify(content, null, 2));
let list = [];
try { list = JSON.parse(fs.readFileSync(DB, "utf8")); } catch (e) {}
const save = () => fs.writeFileSync(DB, JSON.stringify(list, null, 2));

/* ---------- validation ---------- */
const S = (v, n) => typeof v === "string" ? v.trim().slice(0, n) : "";
const newId = () => Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const TAGS = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "g"]);
function cleanIcon(code) {                       /* accepts a full <svg> or just the inner shapes */
  const c = S(code, 4000).replace(/^<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, "").trim();
  if (!c || /<[^a-zA-Z\/]/.test(c) || /\bon\w+\s*=|javascript:|href\s*=/i.test(c)) return null;
  const t = c.match(/<\/?\s*[a-zA-Z][\w:-]*/g) || [];
  if (!t.length || t.some(x => !TAGS.has(x.replace(/[<\/\s]/g, "").toLowerCase()))) return null;
  return c;
}
function saveImage(u) {
  const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof u === "string" ? u : "");
  if (!m) throw new Error("Please choose a PNG, JPG or WebP picture.");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 6e6) throw new Error("That picture is too large (6 MB max).");
  const name = crypto.randomBytes(8).toString("hex") + "." + (m[1] === "jpeg" ? "jpg" : m[1]);
  fs.writeFileSync(path.join(UP, name), buf);
  return "/uploads/" + name;
}
const sections = {                                /* each validates, then updates content */
  about(b) {
    const paragraphs = (Array.isArray(b.paragraphs) ? b.paragraphs : []).map(x => S(x, 1500)).filter(Boolean).slice(0, 6);
    const o = { heading: S(b.heading, 160), paragraphs, email: S(b.email, 120), phone: S(b.phone, 40), address: S(b.address, 160) };
    if (!o.heading) throw new Error("The headline can't be empty.");
    if (!paragraphs.length) throw new Error("Write at least one paragraph.");
    if (!EMAIL.test(o.email)) throw new Error("Enter a valid email address.");
    content.about = o;
  },
  services(b) {
    if (!Array.isArray(b.items) || b.items.length > 12) throw new Error("Invalid services (12 max).");
    content.services = b.items.map(x => {
      const title = S(x.title, 60), desc = S(x.desc, 220), icon = cleanIcon(x.icon);
      if (!title) throw new Error("Every service needs a title.");
      if (!desc) throw new Error("Every service needs a short description.");
      if (!icon) throw new Error("Icon code is not valid. Use SVG shapes only (path, circle, rect, line, polyline, polygon, ellipse, g).");
      return { id: S(x.id, 30) || newId(), title, desc, icon };
    });
  },
  qualification(b) {
    if (!Array.isArray(b.skills) || b.skills.length > 30) throw new Error("Invalid skills (30 max).");
    content.qualification = { skills: b.skills.map(x => S(x, 40)).filter(Boolean), languages: S(b.languages, 200), interests: S(b.interests, 200) };
  },
  contact(b) {
    const e = S(b.email, 120);
    if (!EMAIL.test(e)) throw new Error("Enter a valid email address.");
    content.contactEmail = e;
  }
};

/* ---------- helpers ---------- */
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm", ".ico": "image/x-icon", ".woff2": "font/woff2" };
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
const readBody = (req, limit = 10000) => new Promise(ok => {
  let d = "";
  req.on("data", c => { d += c; if (d.length > limit) { ok(null); req.destroy(); } });
  req.on("end", () => { try { ok(JSON.parse(d)); } catch (e) { ok(null); } });
});
const isAdmin = req => {
  const a = Buffer.from(String(req.headers["x-admin-key"] || "")), b = Buffer.from(KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const lastPost = {}, fails = {};

http.createServer(async (req, res) => {
  const p = new URL(req.url, "http://x").pathname, q = new URL(req.url, "http://x").searchParams;

  /* public: site content as a script, so the page can render before anything else runs */
  if (p === "/api/content.js" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
    return res.end("window.SITE=" + JSON.stringify(content).replace(/</g, "\\u003c") + ";");
  }

  /* public: submit + read approved feedback */
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
      list.push({ id: newId(), name, anonymous: b.anonymous === true, message, createdAt: new Date().toISOString(), status: "pending" });
      save();
      return send(res, 201, { ok: true });
    }
  }

  /* admin */
  if (p.startsWith("/api/admin/")) {
    const ip = req.socket.remoteAddress, f = fails[ip] || { n: 0, t: 0 };
    if (Date.now() - f.t > 600000) f.n = 0;
    if (f.n >= 10) return send(res, 429, { error: "Too many attempts. Try again in a few minutes." });
    if (!isAdmin(req)) { f.n++; f.t = Date.now(); fails[ip] = f; return send(res, 401, { error: "Wrong password." }); }
    delete fails[ip];
    const seg = p.split("/").filter(Boolean), area = seg[2], id = seg[3];
    try {
      /* site content */
      if (area === "content" && !id && req.method === "GET") return send(res, 200, content);
      if (area === "content" && id && req.method === "POST") {
        if (!sections[id]) return send(res, 404, { error: "Unknown section." });
        const b = await readBody(req, 40000);
        if (!b) return send(res, 400, { error: "Invalid input." });
        sections[id](b); saveC();
        return send(res, 200, content);
      }
      /* projects: title + picture */
      if (area === "projects") {
        if (!id && req.method === "POST") {
          const b = await readBody(req, 9e6), title = S(b && b.title, 80);
          if (!title) throw new Error("Please enter a project title.");
          if (content.projects.length >= 100) throw new Error("Project limit reached (100).");
          content.projects.push({ id: newId(), title, image: saveImage(b.image) });
          saveC();
          return send(res, 201, content);
        }
        if (id && req.method === "DELETE") {
          const pr = content.projects.find(x => x.id === id);
          if (!pr) return send(res, 404, { error: "Not found." });
          content.projects = content.projects.filter(x => x.id !== id);
          try { fs.unlinkSync(path.join(UP, path.basename(pr.image))); } catch (e) {}
          saveC();
          return send(res, 200, content);
        }
      }
      /* feedback: list, add (admin-written), approve / reject / delete */
      if (area === "feedback") {
        if (!id && req.method === "GET") {
          const s = q.get("status");
          return send(res, 200, list.filter(x => !s || x.status === s).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        }
        if (!id && req.method === "POST") {
          const b = await readBody(req, 5000) || {}, name = S(b.name, 60), message = S(b.message, 500);
          if (!name) throw new Error("Enter a name.");
          if (message.length < 10) throw new Error("The message needs at least 10 characters.");
          const d = b.createdAt ? new Date(b.createdAt) : new Date();
          list.push({ id: newId(), name, anonymous: b.anonymous === true, message, createdAt: (isNaN(d) ? new Date() : d).toISOString(), status: "approved", fake: true });
          save();
          return send(res, 201, { ok: true });
        }
        const item = list.find(x => x.id === id);
        if (!item) return send(res, 404, { error: "Not found." });
        if (req.method === "POST") {
          const b = await readBody(req);
          if (!b || !["pending", "approved", "rejected"].includes(b.status)) return send(res, 400, { error: "Invalid status." });
          item.status = b.status; save();
          return send(res, 200, item);
        }
        if (req.method === "DELETE") { list = list.filter(x => x.id !== id); save(); return send(res, 200, { ok: true }); }
      }
    } catch (e) { return send(res, 400, { error: e.message }); }
    return send(res, 404, { error: "Not found." });
  }

  /* static files (never the server or the data files) */
  let f = p === "/" ? "/index.html" : p === "/admin" ? "/admin.html" : decodeURIComponent(p);
  const file = path.join(ROOT, path.normalize(f)), base = path.basename(file);
  if (!file.startsWith(ROOT + path.sep) || base.startsWith(".") || ["server.js", "feedback.json", "content.json"].includes(base) || file.includes("node_modules") || !MIME[path.extname(file)]) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] }); res.end(data);
  });
}).listen(PORT, () => console.log("Site: http://localhost:" + PORT + "   Admin: http://localhost:" + PORT + "/admin"));

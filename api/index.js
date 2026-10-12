/* All API routes for Vercel (one catch-all function). Data lives in Upstash Redis (REST), no packages needed.
   Env vars: ADMIN_PASSWORD, plus UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN),
   which the Upstash integration adds for you. */
const crypto = require("crypto");
const RU = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const RT = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const KEY = process.env.ADMIN_PASSWORD || "";

async function R(...cmd) {
  if (!RU || !RT) { const e = new Error("Storage is not connected. Add the Upstash Redis integration to this Vercel project, then redeploy."); e.storage = true; throw e; }
  const r = await fetch(RU, { method: "POST", headers: { Authorization: "Bearer " + RT, "Content-Type": "application/json" }, body: JSON.stringify(cmd.map(String)) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) { const e = new Error("Storage error: " + (j.error || r.status)); e.storage = true; throw e; }
  return j.result;
}
const clone = o => JSON.parse(JSON.stringify(o));

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
  social: { instagram: "", linkedin: "", facebook: "", whatsapp: "" },
  categories: [],                                 /* [{id, name}] created in the admin panel */
  projects: []                                    /* [{id, title, url, category, image}] */
};

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
function cleanUrl(v) {                            /* project link: http(s) only; "example.com/x" gets https:// added */
  v = S(v, 500);
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) { if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(v)) return null; v = "https://" + v; }
  let u; try { u = new URL(v); } catch (e) { return null; }
  return /^https?:$/.test(u.protocol) && u.hostname.includes(".") ? u.href : null;
}
const sections = {                                /* each validates, then updates content */
  about(c, b) {
    const paragraphs = (Array.isArray(b.paragraphs) ? b.paragraphs : []).map(x => S(x, 1500)).filter(Boolean).slice(0, 6);
    const o = { heading: S(b.heading, 160), paragraphs, email: S(b.email, 120), phone: S(b.phone, 40), address: S(b.address, 160) };
    if (!o.heading) throw new Error("The headline can't be empty.");
    if (!paragraphs.length) throw new Error("Write at least one paragraph.");
    if (!EMAIL.test(o.email)) throw new Error("Enter a valid email address.");
    c.about = o;
  },
  services(c, b) {
    if (!Array.isArray(b.items) || b.items.length > 12) throw new Error("Invalid services (12 max).");
    c.services = b.items.map(x => {
      const title = S(x.title, 60), desc = S(x.desc, 220), icon = cleanIcon(x.icon);
      if (!title) throw new Error("Every service needs a title.");
      if (!desc) throw new Error("Every service needs a short description.");
      if (!icon) throw new Error("Icon code is not valid. Use SVG shapes only (path, circle, rect, line, polyline, polygon, ellipse, g).");
      return { id: S(x.id, 30) || newId(), title, desc, icon };
    });
  },
  qualification(c, b) {
    if (!Array.isArray(b.skills) || b.skills.length > 30) throw new Error("Invalid skills (30 max).");
    c.qualification = { skills: b.skills.map(x => S(x, 40)).filter(Boolean), languages: S(b.languages, 200), interests: S(b.interests, 200) };
  },
  social(c, b) {                                   /* Instagram / LinkedIn / Facebook links + WhatsApp number; empty = hidden on the site */
    const NAMES = { instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook" };
    const HOSTS = { instagram: /(^|\.)instagram\.com$/, linkedin: /(^|\.)linkedin\.com$/, facebook: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/ };
    const o = {};
    for (const k of Object.keys(NAMES)) {
      let v = S(b[k], 300);
      if (!v) { o[k] = ""; continue; }
      if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = "https://" + v;
      let url; try { url = new URL(v); } catch (e) { throw new Error("The " + NAMES[k] + " link is not a valid web address. Paste the full profile link."); }
      if (!/^https?:$/.test(url.protocol) || !HOSTS[k].test(url.hostname.toLowerCase())) throw new Error("The " + NAMES[k] + " link must be a " + NAMES[k] + " address.");
      url.protocol = "https:"; o[k] = url.href;
    }
    let w = S(b.whatsapp, 80);
    if (w) {
      const m = /wa\.me\/(\d+)/i.exec(w), d = (m ? m[1] : w).replace(/\D/g, "");
      if (d.length < 8 || d.length > 15 || d[0] === "0") throw new Error("Enter the WhatsApp number with its country code and no leading 0, for example +880 1712 345678.");
      w = d;
    }
    o.whatsapp = w;
    c.social = o;
  },
  contact(c, b) {
    const e = S(b.email, 120);
    if (!EMAIL.test(e)) throw new Error("Enter a valid email address.");
    c.contactEmail = e;
  }
};


async function getContent() {
  const c = clone(DEFAULTS), raw = await R("GET", "site:content");
  if (raw) { try { const o = JSON.parse(raw); for (const k in o) c[k] = o[k]; } catch (e) {} }
  return c;
}
const setContent = c => R("SET", "site:content", JSON.stringify(c));
function parseImage(u) {
  const m = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof u === "string" ? u : "");
  if (!m) throw new Error("Please choose a PNG, JPG or WebP picture.");
  if (m[2].length > 700000) throw new Error("That picture is too large. Try a smaller one.");
  return { type: "image/" + m[1], b64: m[2] };
}
async function allFb() {
  const a = (await R("HGETALL", "site:fb")) || [], out = [];
  for (let i = 0; i < a.length; i += 2) { try { out.push(JSON.parse(a[i + 1])); } catch (e) {} }
  return out.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

/* CV (PDF): stored in Redis as base64 chunks, because Upstash limits the size of a single request.
   Content only holds {name, url}; the file itself is served by GET /api/index?p=cv */
const CV_CHUNK = 600000, CV_MAX_B64 = 4200000;   /* ~3 MB file; Vercel's request body limit is 4.5 MB */
async function cvMeta() { try { return JSON.parse((await R("GET", "site:cv:meta")) || "null"); } catch (e) { return null; } }
async function delCvChunks(from, to) { for (let i = from; i < to; i++) await R("DEL", "site:cv:" + i); }

async function route(req, res, send) {
  const u = new URL(req.url, "http://x"), q = u.searchParams, m = req.method;
  /* vercel.json rewrites /api/anything to this file as ?p=anything */
  const p = (q.has("p") ? "/api/" + q.get("p") : u.pathname).replace(/\/+$/, "");
  const body = () => { let b = req.body; if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = null; } } return b && typeof b === "object" ? b : null; };
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";

  /* public: site content as a script, so the page can render before anything else runs */
  if (p === "/api/content" && m === "GET") {
    let c; try { c = await getContent(); } catch (e) { c = clone(DEFAULTS); }
    res.statusCode = 200; res.setHeader("Content-Type", "text/javascript; charset=utf-8"); res.setHeader("Cache-Control", "no-store");
    return res.end("window.SITE=" + JSON.stringify(c).replace(/</g, "\\u003c") + ";");
  }
  /* public: project pictures */
  if (p.startsWith("/api/img/") && m === "GET") {
    const id = p.slice(9).replace(/[^a-f0-9]/g, ""), v = id && await R("GET", "site:img:" + id);
    if (!v) { res.statusCode = 404; return res.end("Not found"); }
    const i = v.indexOf("|");
    res.statusCode = 200; res.setHeader("Content-Type", v.slice(0, i)); res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.end(Buffer.from(v.slice(i + 1), "base64"));
  }
  /* public: the CV download */
  if (p === "/api/cv" && m === "GET") {
    const meta = await cvMeta();
    if (!meta || !meta.n) { res.statusCode = 404; return res.end("Not found"); }
    let b64 = "";
    for (let i = 0; i < meta.n; i++) {
      const part = await R("GET", "site:cv:" + i);
      if (!part) { res.statusCode = 404; return res.end("Not found"); }
      b64 += part;
    }
    const fname = String(meta.name || "CV.pdf").replace(/[^\w.\- ]/g, "_");
    res.statusCode = 200; res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="' + fname + '"');
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");   /* the link carries a version, so a new upload gets a new URL */
    return res.end(Buffer.from(b64, "base64"));
  }
  /* public: submit + read approved feedback */
  if (p === "/api/feedback") {
    if (m === "GET") {
      const out = (await allFb()).filter(f => f.status === "approved")
        .map(f => f.anonymous ? { message: f.message, date: f.createdAt, anonymous: true }   /* real name never leaves the server */
                              : { message: f.message, date: f.createdAt, anonymous: false, name: f.name });
      return send(200, out);
    }
    if (m === "POST") {
      const b = body(), name = b && typeof b.name === "string" ? b.name.trim() : "", message = b && typeof b.message === "string" ? b.message.trim() : "";
      if (!name || name.length > 60 || message.length < 10 || message.length > 500) return send(400, { error: "Invalid input." });
      if (!(await R("SET", "rl:" + ip, "1", "EX", "20", "NX"))) return send(429, { error: "Please wait a moment." });
      const id = newId();
      await R("HSET", "site:fb", id, JSON.stringify({ id, name, anonymous: b.anonymous === true, message, createdAt: new Date().toISOString(), status: "pending" }));
      return send(201, { ok: true });
    }
  }

  /* admin */
  if (p.startsWith("/api/admin/")) {
    if (!KEY) return send(503, { error: "ADMIN_PASSWORD is not set. Add it in Vercel > Settings > Environment Variables, then redeploy." });
    const fk = "fail:" + ip, n = +(await R("GET", fk)) || 0;
    if (n >= 10) return send(429, { error: "Too many attempts. Try again in a few minutes." });
    const hs = x => crypto.createHash("sha256").update(String(x)).digest();
    if (!crypto.timingSafeEqual(hs(req.headers["x-admin-key"] || ""), hs(KEY))) {
      if ((await R("INCR", fk)) === 1) await R("EXPIRE", fk, 600);
      return send(401, { error: "Wrong password." });
    }
    if (n) await R("DEL", fk);
    const seg = p.split("/").filter(Boolean), area = seg[2], id = seg[3];
    try {
      /* site content */
      if (area === "content" && !id && m === "GET") return send(200, await getContent());
      /* CV: upload / replace ({name, data: PDF data URL}) or remove (empty data) */
      if (area === "content" && id === "cv" && m === "POST") {
        const b = body(); if (!b) return send(400, { error: "Invalid input." });
        const c = await getContent(), old = await cvMeta(), oldN = (old && old.n) || 0;
        if (!b.data) {
          delete c.cv; await setContent(c); await delCvChunks(0, oldN); await R("DEL", "site:cv:meta");
          return send(200, c);
        }
        const mm = /^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/.exec(typeof b.data === "string" ? b.data : "");
        if (!mm) throw new Error("Please choose a PDF file.");
        const b64 = mm[1];
        if (b64.length > CV_MAX_B64) throw new Error("That PDF is too large (3 MB max).");
        if (Buffer.from(b64.slice(0, 8), "base64").toString("latin1").slice(0, 4) !== "%PDF") throw new Error("That file is not a valid PDF.");
        let name = S(b.name, 120).replace(/[\\\/]/g, "_") || "CV.pdf";
        if (!/\.pdf$/i.test(name)) name += ".pdf";
        const n = Math.ceil(b64.length / CV_CHUNK);
        for (let i = 0; i < n; i++) await R("SET", "site:cv:" + i, b64.slice(i * CV_CHUNK, (i + 1) * CV_CHUNK));
        await R("SET", "site:cv:meta", JSON.stringify({ name, n }));
        await delCvChunks(n, oldN);                       /* drop leftover chunks of a longer, older file */
        c.cv = { name, url: "/api/index?p=cv&v=" + Date.now().toString(36) };
        await setContent(c);
        return send(200, c);
      }
      if (area === "content" && id && m === "POST") {
        if (!sections[id]) return send(404, { error: "Unknown section." });
        const b = body(); if (!b) return send(400, { error: "Invalid input." });
        const c = await getContent(); sections[id](c, b); await setContent(c);
        return send(200, c);
      }
      /* categories: the headings of the All Projects view */
      if (area === "categories") {
        const c = await getContent(); c.categories = Array.isArray(c.categories) ? c.categories : [];
        if (!id && m === "POST") {
          const name = S((body() || {}).name, 40);
          if (!name) throw new Error("Enter a category name.");
          if (c.categories.length >= 20) throw new Error("Category limit reached (20).");
          if (c.categories.some(x => x.name.toLowerCase() === name.toLowerCase())) throw new Error("That category already exists.");
          c.categories.push({ id: newId(), name });
          await setContent(c); return send(201, c);
        }
        const cat = id && c.categories.find(x => x.id === id);
        if (id && !cat) return send(404, { error: "Not found." });
        if (id && m === "POST") {                      /* rename */
          const name = S((body() || {}).name, 40);
          if (!name) throw new Error("Enter a category name.");
          if (c.categories.some(x => x.id !== id && x.name.toLowerCase() === name.toLowerCase())) throw new Error("That category already exists.");
          cat.name = name; await setContent(c); return send(200, c);
        }
        if (id && m === "DELETE") {
          const n = c.projects.filter(x => x.category === id).length;
          if (n) throw new Error("This category still has " + n + (n === 1 ? " project" : " projects") + ". Move or remove " + (n === 1 ? "it" : "them") + " first.");
          c.categories = c.categories.filter(x => x.id !== id);
          await setContent(c); return send(200, c);
        }
      }
      /* projects: title + link + category + picture */
      if (area === "projects") {
        if (!id && m === "POST") {
          const b = body() || {}, title = S(b.title, 80), url = cleanUrl(b.url);
          if (!title) throw new Error("Please enter a project title.");
          if (!url) throw new Error("Please enter a valid project URL, for example https://youtube.com/watch?v=...");
          const c = await getContent(), cat = S(b.category, 40);
          if (!(c.categories || []).some(x => x.id === cat)) throw new Error("Please choose a category. Create one first if the list is empty.");
          const img = b.image ? parseImage(b.image) : null;     /* the picture is optional: the site draws a placeholder card */
          if (c.projects.length >= 100) throw new Error("Project limit reached (100).");
          const pid = crypto.randomBytes(8).toString("hex");
          if (img) await R("SET", "site:img:" + pid, img.type + "|" + img.b64);
          c.projects.push({ id: pid, title, url, category: cat, image: img ? "/api/index?p=img/" + pid : "" });
          await setContent(c);
          return send(201, c);
        }
        if (id && m === "POST") {                      /* move a project to another category */
          const c = await getContent(), pr = c.projects.find(x => x.id === id), cat = S((body() || {}).category, 40);
          if (!pr) return send(404, { error: "Not found." });
          if (!(c.categories || []).some(x => x.id === cat)) throw new Error("Please choose a category.");
          pr.category = cat; await setContent(c); return send(200, c);
        }
        if (id && m === "DELETE") {
          const c = await getContent();
          if (!c.projects.some(x => x.id === id)) return send(404, { error: "Not found." });
          c.projects = c.projects.filter(x => x.id !== id);
          await setContent(c); await R("DEL", "site:img:" + id.replace(/[^a-f0-9]/g, ""));
          return send(200, c);
        }
      }
      /* feedback: list, add (admin-written), approve / reject / delete */
      if (area === "feedback") {
        if (!id && m === "GET") { const s = q.get("status"); return send(200, (await allFb()).filter(x => !s || x.status === s)); }
        if (!id && m === "POST") {
          const b = body() || {}, name = S(b.name, 60), message = S(b.message, 500);
          if (!name) throw new Error("Enter a name.");
          if (message.length < 10) throw new Error("The message needs at least 10 characters.");
          const d = b.createdAt ? new Date(b.createdAt) : new Date(), fid = newId();
          await R("HSET", "site:fb", fid, JSON.stringify({ id: fid, name, anonymous: b.anonymous === true, message, createdAt: (isNaN(d) ? new Date() : d).toISOString(), status: "approved", fake: true }));
          return send(201, { ok: true });
        }
        const raw = await R("HGET", "site:fb", id);
        if (!raw) return send(404, { error: "Not found." });
        if (m === "POST") {
          const b = body();
          if (!b || !["pending", "approved", "rejected"].includes(b.status)) return send(400, { error: "Invalid status." });
          const item = JSON.parse(raw); item.status = b.status;
          await R("HSET", "site:fb", id, JSON.stringify(item));
          return send(200, item);
        }
        if (m === "DELETE") { await R("HDEL", "site:fb", id); return send(200, { ok: true }); }
      }
    } catch (e) { return send(e.storage ? 503 : 400, { error: e.message }); }
    return send(404, { error: "Not found." });
  }
  return send(404, { error: "Not found." });
}

module.exports = async (req, res) => {
  const send = (code, obj) => { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(obj)); };
  try { await route(req, res, send); } catch (e) { send(e.storage ? 503 : 500, { error: e.message }); }
};

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = __dirname;
const outputDir = path.join(projectRoot, "dist", "server");
const outputFile = path.join(outputDir, "index.js");

const assetFiles = [
  ["", "index.html", "text/html; charset=utf-8"],
  ["/", "index.html", "text/html; charset=utf-8"],
  ["/index.html", "index.html", "text/html; charset=utf-8"],
  ["/app.js", "app.js", "application/javascript; charset=utf-8"],
  ["/styles.css", "styles.css", "text/css; charset=utf-8"],
  ["/polish.css", "polish.css", "text/css; charset=utf-8"],
  ["/live.html", "live.html", "text/html; charset=utf-8"],
  ["/live.js", "live.js", "application/javascript; charset=utf-8"],
  ["/live.css", "live.css", "text/css; charset=utf-8"],
  ["/README.md", "README.md", "text/markdown; charset=utf-8"]
];

const assets = Object.fromEntries(
  assetFiles.map(([route, filename, type]) => [
    route,
    {
      type,
      body: fs.readFileSync(path.join(projectRoot, filename), "utf8")
    }
  ])
);

const defaultBuddy = {
  name: "Jamie",
  character: "milo",
  icon: "STAR",
  mood: "Steady guide"
};

const worker = `
const STATIC_ASSETS = ${JSON.stringify(assets)};
const DEFAULT_BUDDY = ${JSON.stringify(defaultBuddy)};
const PASSWORD_ALGORITHM = "pbkdf2-sha256";
const PASSWORD_ITERATIONS = 120000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: securityHeaders({
          "Allow": "GET, HEAD, POST, PUT, OPTIONS"
        })
      });
    }

    try {
      if (url.pathname.startsWith("/api/")) {
        return handleApi(request, env, url);
      }

      return serveStatic(url.pathname);
    } catch (error) {
      return json({ error: "Server error. Try again in a moment." }, 500);
    }
  }
};

function serveStatic(pathname) {
  const route = pathname === "/" ? "/" : pathname;
  const asset = STATIC_ASSETS[route] || STATIC_ASSETS["/index.html"];

  return new Response(asset.body, {
    headers: securityHeaders({
      "Content-Type": asset.type,
      "Cache-Control": "no-store"
    })
  });
}

async function handleApi(request, env, url) {
  if (!env.DB) {
    return json({ error: "Cloud storage is not configured yet." }, 503);
  }

  if (url.pathname === "/api/signup" && request.method === "POST") {
    return signup(request, env);
  }

  if (url.pathname === "/api/login" && request.method === "POST") {
    return login(request, env);
  }

  if (url.pathname === "/api/password-reset/request" && request.method === "POST") {
    return requestPasswordReset(request, env);
  }

  if (url.pathname === "/api/password-reset/confirm" && request.method === "POST") {
    return confirmPasswordReset(request, env);
  }

  const account = await requireAccount(request, env);
  if (!account) {
    return json({ error: "Sign in again to continue." }, 401);
  }

  if (url.pathname === "/api/state" && request.method === "GET") {
    return getState(env, account.email);
  }

  if (url.pathname === "/api/state" && request.method === "PUT") {
    return putState(request, env, account.email);
  }

  if (url.pathname === "/api/buddy" && request.method === "PUT") {
    return putBuddy(request, env, account.email);
  }

  if (url.pathname === "/api/session" && request.method === "GET") {
    return getSessionState(env, account.email);
  }

  if (url.pathname === "/api/session" && request.method === "PUT") {
    return putSessionState(request, env, account.email);
  }

  if (url.pathname.startsWith("/api/media/")) {
    if (!env.BUCKET) {
      return json({ error: "Audio storage is not configured yet." }, 503);
    }
    return handleMedia(request, env, account.email, url.pathname.slice("/api/media/".length));
  }

  return json({ error: "Not found." }, 404);
}

async function signup(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const name = cleanText(body.name, 80);
  const passwordHash = cleanHash(body.passwordHash);

  if (!email || !name || !passwordHash) {
    return json({ error: "Name, email, and password are required." }, 400);
  }

  const existing = await env.DB.prepare("SELECT email FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return json({ error: "Account already exists." }, 409);
  }

  const now = new Date().toISOString();
  const token = createToken();
  const buddy = JSON.stringify(normalizeBuddy(body.buddy));
  const passwordRecord = await createPasswordRecord(passwordHash);

  await env.DB.batch([
    env.DB.prepare("INSERT INTO users (email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
      .bind(email, name, passwordRecord, now, now),
    env.DB.prepare("INSERT INTO account_state (email, buddy_json, songs_json, active_session_json, updated_at) VALUES (?, ?, ?, ?, ?)")
      .bind(email, buddy, "[]", "{}", now),
    env.DB.prepare("INSERT INTO sessions (token, email, created_at) VALUES (?, ?, ?)")
      .bind(token, email, now)
  ]);

  return json({ token, email, name });
}

async function login(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const passwordHash = cleanHash(body.passwordHash);

  if (!email || !passwordHash) {
    return json({ error: "Email and password are required." }, 400);
  }

  const user = await env.DB.prepare("SELECT email, name, password_hash FROM users WHERE email = ?").bind(email).first();
  if (!user || !(await verifyPasswordRecord(passwordHash, user.password_hash))) {
    return json({ error: "That email and password do not match." }, 401);
  }

  const token = createToken();
  const statements = [
    env.DB.prepare("INSERT INTO sessions (token, email, created_at) VALUES (?, ?, ?)")
      .bind(token, email, new Date().toISOString())
  ];

  if (isLegacyPasswordRecord(user.password_hash)) {
    statements.push(
      env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE email = ?")
        .bind(await createPasswordRecord(passwordHash), new Date().toISOString(), email)
    );
  }

  await env.DB.batch(statements);

  return json({ token, email, name: user.name });
}

async function requestPasswordReset(request, env) {
  await ensurePasswordResetTable(env);

  const body = await readJson(request);
  const email = normalizeEmail(body.email);

  if (!email) {
    return json({ error: "Enter a valid account email." }, 400);
  }

  const user = await env.DB.prepare("SELECT email FROM users WHERE email = ?").bind(email).first();
  if (!user) {
    return json({ ok: true, message: "If that account exists, a reset code is ready." });
  }

  const resetCode = createResetCode();
  const expiresAt = Date.now() + (15 * 60 * 1000);
  const now = new Date().toISOString();

  await env.DB.prepare("INSERT OR REPLACE INTO password_resets (email, reset_code, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(email, resetCode, expiresAt, now)
    .run();

  const response = {
    ok: true,
    expiresInMinutes: 15,
    message: "If that account exists, a reset request is ready. Contact the program owner for help completing the reset."
  };

  if (cleanText(env && env.ALLOW_SCREEN_RESET_CODES, 8).toLowerCase() === "true") {
    response.resetCode = resetCode;
    response.message = "Use this reset code to change your password.";
  }

  return json(response);
}

async function confirmPasswordReset(request, env) {
  await ensurePasswordResetTable(env);

  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const resetCode = cleanResetCode(body.resetCode);
  const passwordHash = cleanHash(body.passwordHash);

  if (!email || !resetCode || !passwordHash) {
    return json({ error: "Email, reset code, and new password are required." }, 400);
  }

  const reset = await env.DB.prepare("SELECT reset_code, expires_at FROM password_resets WHERE email = ?")
    .bind(email)
    .first();

  if (!reset || reset.reset_code !== resetCode) {
    return json({ error: "That reset code does not match. Request a new code and try again." }, 400);
  }

  if (Number(reset.expires_at) < Date.now()) {
    await env.DB.prepare("DELETE FROM password_resets WHERE email = ?").bind(email).run();
    return json({ error: "That reset code expired. Request a new code and try again." }, 400);
  }

  const existing = await env.DB.prepare("SELECT email FROM users WHERE email = ?").bind(email).first();
  if (!existing) {
    return json({ error: "We could not find that account." }, 404);
  }

  const now = new Date().toISOString();
  const passwordRecord = await createPasswordRecord(passwordHash);
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE email = ?")
      .bind(passwordRecord, now, email),
    env.DB.prepare("DELETE FROM sessions WHERE email = ?")
      .bind(email),
    env.DB.prepare("DELETE FROM password_resets WHERE email = ?")
      .bind(email)
  ]);

  return json({ ok: true });
}

async function getState(env, email) {
  const row = await getOrCreateState(env, email);
  const rawBuddy = parseJson(row.buddy_json, DEFAULT_BUDDY);
  const buddy = normalizeBuddy(rawBuddy);

  if (rawBuddy && (
    Object.prototype.hasOwnProperty.call(rawBuddy, "studentName") ||
    Object.prototype.hasOwnProperty.call(rawBuddy, "studentPhotoDataUrl")
  )) {
    await env.DB.prepare("UPDATE account_state SET buddy_json = ?, updated_at = ? WHERE email = ?")
      .bind(JSON.stringify(buddy), new Date().toISOString(), email)
      .run();
  }

  return json({
    buddy,
    songs: parseJson(row.songs_json, []),
    activeSession: parseJson(row.active_session_json, {})
  });
}

async function putState(request, env, email) {
  const body = await readJson(request);
  const now = new Date().toISOString();
  const buddyJson = JSON.stringify(normalizeBuddy(body.buddy));
  const songsJson = JSON.stringify(normalizeSongs(body.songs));
  const sessionJson = JSON.stringify(normalizeSession(body.activeSession));

  await getOrCreateState(env, email);
  await env.DB.prepare("UPDATE account_state SET buddy_json = ?, songs_json = ?, active_session_json = ?, updated_at = ? WHERE email = ?")
    .bind(buddyJson, songsJson, sessionJson, now, email)
    .run();

  return json({ ok: true });
}

async function putBuddy(request, env, email) {
  const body = await readJson(request);
  await getOrCreateState(env, email);
  await env.DB.prepare("UPDATE account_state SET buddy_json = ?, updated_at = ? WHERE email = ?")
    .bind(JSON.stringify(normalizeBuddy(body.buddy)), new Date().toISOString(), email)
    .run();

  return json({ ok: true });
}

async function getSessionState(env, email) {
  const row = await getOrCreateState(env, email);
  return json(withServerTime(parseJson(row.active_session_json, {})));
}

async function putSessionState(request, env, email) {
  const body = await readJson(request);
  const session = normalizeSession(body);
  const sessionJson = JSON.stringify(session);

  await getOrCreateState(env, email);
  await env.DB.prepare("UPDATE account_state SET active_session_json = ?, updated_at = ? WHERE email = ?")
    .bind(sessionJson, new Date().toISOString(), email)
    .run();

  return json(withServerTime(session));
}

async function handleMedia(request, env, email, rawId) {
  const mediaId = decodeURIComponent(rawId || "");
  if (!/^[A-Za-z0-9._:-]+$/.test(mediaId)) {
    return json({ error: "Invalid media id." }, 400);
  }

  const key = encodeURIComponent(email) + "/" + mediaId;

  if (request.method === "HEAD") {
    const object = await env.BUCKET.head(key);
    if (!object) {
      return new Response(null, { status: 404 });
    }

    return new Response(null, {
      status: 204,
      headers: securityHeaders({
        "Cache-Control": "no-store",
        "X-Media-Available": "true"
      })
    });
  }

  if (request.method === "GET") {
    const object = await env.BUCKET.get(key);
    if (!object) {
      return json({ error: "Media not found." }, 404);
    }

    const dataUrl = await object.text();
    const accept = request.headers.get("Accept") || "";

    if (accept.includes("text/plain")) {
      return new Response(dataUrl, {
        headers: securityHeaders({
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        })
      });
    }

    return json({ dataUrl });
  }

  if (request.method === "PUT") {
    let dataUrl = "";
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      const body = await readJson(request);
      dataUrl = body.dataUrl;
    } else {
      dataUrl = await request.text();
    }

    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return json({ error: "Media upload needs a data URL." }, 400);
    }

    await env.BUCKET.put(key, dataUrl, {
      httpMetadata: { contentType: "text/plain; charset=utf-8" }
    });

    return json({ ok: true });
  }

  return json({ error: "Method not allowed." }, 405);
}

async function requireAccount(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return null;
  }

  return env.DB.prepare("SELECT email FROM sessions WHERE token = ?").bind(token).first();
}

async function getOrCreateState(env, email) {
  const row = await env.DB.prepare("SELECT buddy_json, songs_json, active_session_json FROM account_state WHERE email = ?")
    .bind(email)
    .first();

  if (row) {
    return row;
  }

  const now = new Date().toISOString();
  await env.DB.prepare("INSERT INTO account_state (email, buddy_json, songs_json, active_session_json, updated_at) VALUES (?, ?, ?, ?, ?)")
    .bind(email, JSON.stringify(DEFAULT_BUDDY), "[]", "{}", now)
    .run();

  return {
    buddy_json: JSON.stringify(DEFAULT_BUDDY),
    songs_json: "[]",
    active_session_json: "{}"
  };
}

async function ensurePasswordResetTable(env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS password_resets (email TEXT PRIMARY KEY, reset_code TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL)"
  ).run();
}

function normalizeBuddy(buddy) {
  const next = buddy && typeof buddy === "object" ? { ...DEFAULT_BUDDY, ...buddy } : { ...DEFAULT_BUDDY };
  next.name = cleanText(next.name, 40) || DEFAULT_BUDDY.name;
  next.character = cleanText(next.character, 24) || DEFAULT_BUDDY.character;
  next.icon = cleanText(next.icon, 24) || DEFAULT_BUDDY.icon;
  next.mood = cleanText(next.mood, 40) || DEFAULT_BUDDY.mood;
  delete next.studentName;
  delete next.studentPhotoDataUrl;
  return next;
}

function normalizeSongs(songs) {
  if (!Array.isArray(songs)) {
    return [];
  }

  return songs.slice(0, 50).map((song) => {
    const normalized = {
      ...song,
      title: cleanText(song.title, 80),
      trackDataUrl: "",
      cueDataUrl: "",
      cueIntervals: Array.isArray(song.cueIntervals)
        ? song.cueIntervals.slice(0, 200).map((cue, index) => {
          const normalizedCue = {
            ...cue,
            id: cleanText(cue.id, 120) || "cue-" + index,
            label: cleanText(cue.label, 60) || "Cue " + (index + 1),
            lyrics: cleanText(cue.lyrics || cue.text, 260),
            sectionId: cleanText(cue.sectionId, 80),
            startTime: Math.max(Number(cue.startTime) || 0, 0),
            singerStartTime: Math.max(Number(cue.singerStartTime) || Number(cue.startTime) || 0, 0),
            duration: Math.max(Number(cue.duration) || 4, 0.1)
          };
          delete normalizedCue.studentName;
          delete normalizedCue.studentPhoto;
          delete normalizedCue.studentPhotoDataUrl;
          return normalizedCue;
        })
        : [],
      sections: Array.isArray(song.sections)
        ? song.sections.slice(0, 10).map((section, index) => ({
          id: cleanText(section.id, 80) || "section-" + (index + 1),
          name: cleanText(section.name, 60) || "Section " + (index + 1)
        }))
        : []
    };
    delete normalized.studentName;
    delete normalized.studentPhoto;
    delete normalized.studentPhotoDataUrl;
    return normalized;
  });
}

function normalizeSession(session) {
  const normalized = {
    songId: cleanText(session && session.songId, 120),
    sectionId: cleanText(session && session.sectionId, 80)
  };

  if (session && session.playback && session.playback.action === "schedule-start") {
    const now = Date.now();
    normalized.playback = {
      state: "scheduled",
      commandId: createToken(),
      songId: normalized.songId,
      startAt: now + 3000,
      requestedAt: now
    };
  } else if (session && session.playback && session.playback.action === "cue-hit") {
    const now = Date.now();
    normalized.playback = {
      state: "cue-hit",
      commandId: createToken(),
      songId: normalized.songId,
      sectionId: normalized.sectionId,
      cueId: cleanText(session.playback.cueId, 120),
      cueSectionId: cleanText(session.playback.cueSectionId, 80),
      label: cleanText(session.playback.label, 80),
      lyrics: cleanText(session.playback.lyrics, 260),
      startTime: Math.max(Number(session.playback.startTime) || 0, 0),
      singerStartTime: Math.max(Number(session.playback.singerStartTime) || Number(session.playback.startTime) || 0, 0),
      duration: Math.max(Number(session.playback.duration) || 4, 0.1),
      commandAt: now,
      requestedAt: now
    };
  } else if (session && session.playback && session.playback.action === "pause") {
    const now = Date.now();
    normalized.playback = {
      state: "paused",
      commandId: createToken(),
      songId: normalized.songId,
      sectionId: normalized.sectionId,
      commandAt: now,
      requestedAt: now
    };
  } else if (session && session.playback && session.playback.action === "reset") {
    const now = Date.now();
    normalized.playback = {
      state: "reset",
      commandId: createToken(),
      songId: normalized.songId,
      sectionId: normalized.sectionId,
      commandAt: now,
      requestedAt: now
    };
  } else if (session && session.playback && typeof session.playback === "object") {
    normalized.playback = {
      state: cleanText(session.playback.state, 24),
      commandId: cleanText(session.playback.commandId, 120),
      songId: cleanText(session.playback.songId, 120),
      sectionId: cleanText(session.playback.sectionId, 80),
      cueId: cleanText(session.playback.cueId, 120),
      cueSectionId: cleanText(session.playback.cueSectionId, 80),
      label: cleanText(session.playback.label, 80),
      lyrics: cleanText(session.playback.lyrics, 260),
      startAt: Math.max(Number(session.playback.startAt) || 0, 0),
      startTime: Math.max(Number(session.playback.startTime) || 0, 0),
      singerStartTime: Math.max(Number(session.playback.singerStartTime) || Number(session.playback.startTime) || 0, 0),
      duration: Math.max(Number(session.playback.duration) || 0, 0),
      commandAt: Math.max(Number(session.playback.commandAt) || 0, 0),
      requestedAt: Math.max(Number(session.playback.requestedAt) || 0, 0)
    };
  }

  return normalized;
}

async function createPasswordRecord(clientHash) {
  const salt = createRandomHex(16);
  const derived = await derivePasswordHash(clientHash, salt, PASSWORD_ITERATIONS);
  return PASSWORD_ALGORITHM + "$" + PASSWORD_ITERATIONS + "$" + salt + "$" + derived;
}

async function verifyPasswordRecord(clientHash, storedRecord) {
  const record = typeof storedRecord === "string" ? storedRecord : "";
  if (record.startsWith(PASSWORD_ALGORITHM + "$")) {
    const parts = record.split("$");
    if (parts.length !== 4) {
      return false;
    }

    const iterations = Number(parts[1]);
    const salt = parts[2];
    const expected = parts[3];
    if (!Number.isFinite(iterations) || iterations < 100000 || !/^[0-9a-f]{32}$/.test(salt) || !/^[0-9a-f]{64}$/.test(expected)) {
      return false;
    }

    const actual = await derivePasswordHash(clientHash, salt, iterations);
    return timingSafeEqual(actual, expected);
  }

  return timingSafeEqual(clientHash, record);
}

function isLegacyPasswordRecord(storedRecord) {
  return typeof storedRecord === "string" && !storedRecord.startsWith(PASSWORD_ALGORITHM + "$");
}

async function derivePasswordHash(clientHash, saltHex, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clientHash),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(saltHex),
      iterations,
      hash: "SHA-256"
    },
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

function timingSafeEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return diff === 0;
}

function createRandomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function normalizeEmail(email) {
  const value = typeof email === "string" ? email.trim().toLowerCase() : "";
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(value) ? value : "";
}

function cleanHash(value) {
  const hash = typeof value === "string" ? value.trim() : "";
  return /^[a-zA-Z0-9._:-]{8,160}$/.test(hash) ? hash : "";
}

function cleanResetCode(value) {
  const code = typeof value === "string" ? value.trim() : "";
  return /^\\d{6}$/.test(code) ? code : "";
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function createToken() {
  return crypto.randomUUID() + "-" + crypto.randomUUID();
}

function createResetCode() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const number = bytes.reduce((total, byte) => ((total * 256) + byte), 0);
  return String(100000 + (number % 900000));
}

function withServerTime(payload) {
  return {
    ...(payload && typeof payload === "object" ? payload : {}),
    serverTime: Date.now()
  };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: securityHeaders({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    })
  });
}

function securityHeaders(extra = {}) {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "media-src 'self' data: blob:",
      "connect-src 'self'",
      "font-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https://chatgpt.com"
    ].join("; "),
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    ...extra
  };
}
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, worker);
console.log(outputFile);

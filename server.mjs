/**
 * GISTIC Services - Secure Production Server & API Gateway
 * Native Node.js HTTP + SQLite (node:sqlite) + Bcrypt Auth
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'gistic.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// -----------------------------------------------------------------------------
// 1. DATABASE INITIALIZATION & SCHEMA
// -----------------------------------------------------------------------------
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS setup_tokens (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id TEXT PRIMARY KEY,
    ip_address TEXT,
    email TEXT,
    attempted_at TEXT NOT NULL,
    success INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    service TEXT NOT NULL,
    rating INTEGER NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'approved',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    url TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service TEXT,
    address TEXT,
    preferred_date TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS worker_applications (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    experience TEXT,
    address TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS partnerships (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TEXT NOT NULL
  );
`);

// Seed initial authentic reviews if empty
const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;
if (reviewCount === 0) {
  const seedReviews = [
    { id: 'rev-1', name: 'Chinedu Okeke', service: 'Electrical Works', rating: 5, message: 'The team was professional and fixed the electrical issue effectively. Highly recommended!', date: '2024-01-15' },
    { id: 'rev-2', name: 'Amaka Udeh', service: 'Housekeeping', rating: 4, message: 'Great cleaning service. The staff was polite and thorough.', date: '2024-02-02' },
    { id: 'rev-3', name: 'Tunde Bakare', service: 'Painting', rating: 5, message: 'Excellent painting work. The finish was smooth and professional.', date: '2024-02-10' }
  ];
  const insertRev = db.prepare(`
    INSERT INTO reviews (id, name, service, rating, message, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)
  `);
  seedReviews.forEach(r => insertRev.run(r.id, r.name, r.service, r.rating, r.message, r.date, r.date));
}

// Seed initial gallery if empty
const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery_items').get().count;
if (galleryCount === 0) {
  const insertGal = db.prepare(`
    INSERT INTO gallery_items (id, title, description, type, url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertGal.run('gal-1', 'Residential Solar Installation', 'Complete 5KVA solar inverter array installed in Enugu Metropolis.', 'image', './assets/logo/logo.jpeg', '2024-01-01', '2024-01-01');
  insertGal.run('gal-2', 'GISTIC Fieldwork Showcase', 'Technician on-site inspection and residential service walkthrough.', 'video', './assets/video/vi.mp4', '2024-01-01', '2024-01-01');
}

// -----------------------------------------------------------------------------
// 2. SECURITY & AUTHENTICATION HELPERS
// -----------------------------------------------------------------------------
export const ALLOWED_ADMINS = [
  'chiedozieonyekwelu989@gmail.com',
  'gisticservice@gmail.com'
];

function isAllowedAdmin(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_ADMINS.some(a => a.toLowerCase() === normalized);
}

function checkRateLimit(ip, email) {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const failed = db.prepare(`
    SELECT COUNT(*) as count FROM login_attempts
    WHERE (ip_address = ? OR email = ?) AND success = 0 AND attempted_at > ?
  `).get(ip, email, cutoff).count;
  return failed >= 5;
}

function recordAttempt(ip, email, success) {
  db.prepare(`
    INSERT INTO login_attempts (id, ip_address, email, attempted_at, success)
    VALUES (?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), ip, email, new Date().toISOString(), success ? 1 : 0);
}

function logAudit(email, action, details, ip) {
  db.prepare(`
    INSERT INTO audit_logs (id, admin_email, action, details, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), email, action, details, ip || 'local', new Date().toISOString());
}

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (name) list[name] = decodeURIComponent(rest.join('=').trim());
  });
  return list;
}

function getSessionAdmin(req) {
  const cookies = parseCookies(req);
  const token = cookies['gistic_session'];
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString();

  const session = db.prepare(`
    SELECT s.id, a.id as admin_id, a.email, a.role
    FROM sessions s
    JOIN admins a ON s.admin_id = a.id
    WHERE s.token_hash = ? AND s.expires_at > ? AND a.is_active = 1
  `).get(tokenHash, now);

  if (!session || !isAllowedAdmin(session.email)) return null;
  return session;
}

// -----------------------------------------------------------------------------
// 3. HTTP SERVER & ROUTING
// -----------------------------------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Helper for JSON responses
  const sendJson = (status, data, extraHeaders = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json', ...extraHeaders });
    res.end(JSON.stringify(data));
  };

  // Helper to parse JSON body
  const parseJsonBody = () => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });

  // ---------------------------------------------------------------------------
  // API ROUTES
  // ---------------------------------------------------------------------------

  // Auth: Login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await parseJsonBody();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return sendJson(400, { success: false, error: 'Email and password required.' });
    }

    if (!isAllowedAdmin(email)) {
      recordAttempt(clientIp, email, false);
      return sendJson(403, { success: false, error: 'Invalid credentials or unauthorized account.' });
    }

    if (checkRateLimit(clientIp, email)) {
      return sendJson(429, { success: false, error: 'Too many failed login attempts. Temporarily locked for 15 minutes.' });
    }

    const admin = db.prepare('SELECT id, email, password_hash FROM admins WHERE email = ? AND is_active = 1').get(email);
    if (!admin || !admin.password_hash) {
      recordAttempt(clientIp, email, false);
      return sendJson(401, { success: false, error: 'Account not initialized. Use npm run setup-admin to set your password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      recordAttempt(clientIp, email, false);
      return sendJson(401, { success: false, error: 'Invalid credentials.' });
    }

    // Success
    recordAttempt(clientIp, email, true);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, admin_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), admin.id, tokenHash, expiresAt, new Date().toISOString());

    logAudit(admin.email, 'LOGIN', 'Admin authenticated successfully', clientIp);

    const cookieHeader = `gistic_session=${rawToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    return sendJson(200, { success: true, admin: { email: admin.email } }, { 'Set-Cookie': cookieHeader });
  }

  // Auth: Check Me
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(200, { authenticated: false });
    return sendJson(200, { authenticated: true, admin: { email: admin.email, role: admin.role } });
  }

  // Auth: Logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const admin = getSessionAdmin(req);
    if (admin) {
      logAudit(admin.email, 'LOGOUT', 'Admin logged out', clientIp);
    }
    const clearCookie = `gistic_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
    return sendJson(200, { success: true }, { 'Set-Cookie': clearCookie });
  }

  // Reviews: GET
  if (pathname === '/api/reviews' && req.method === 'GET') {
    const reviews = db.prepare("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC").all();
    return sendJson(200, reviews);
  }

  // Reviews: POST
  if (pathname === '/api/reviews' && req.method === 'POST') {
    const body = await parseJsonBody();
    if (!body.name || !body.service || !body.message) {
      return sendJson(400, { success: false, error: 'Required fields missing.' });
    }
    const id = body.id || `rev-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO reviews (id, name, service, rating, message, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)
    `).run(id, body.name, body.service, parseInt(body.rating) || 5, body.message, now, now);
    return sendJson(200, { success: true, id });
  }

  // Reviews: DELETE
  if (pathname.startsWith('/api/reviews/') && req.method === 'DELETE') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const id = pathname.replace('/api/reviews/', '');
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    logAudit(admin.email, 'DELETE_REVIEW', `Deleted review ID: ${id}`, clientIp);
    return sendJson(200, { success: true });
  }

  // Form Submissions: Bookings
  if (pathname === '/api/bookings' && req.method === 'POST') {
    const body = await parseJsonBody();
    const id = `book-${crypto.randomUUID()}`;
    db.prepare(`
      INSERT INTO enquiries (id, type, name, email, phone, service, address, preferred_date, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
    `).run(id, body.type || 'service_booking', body.name || 'Anonymous', body.email || null, body.phone || '', body.service || 'General', body.address || null, body.date || null, body.message || null, new Date().toISOString());
    return sendJson(200, { success: true });
  }

  // Form Submissions: Worker Applications
  if (pathname === '/api/applications' && req.method === 'POST') {
    const body = await parseJsonBody();
    const id = `work-${crypto.randomUUID()}`;
    db.prepare(`
      INSERT INTO worker_applications (id, full_name, email, phone, role, experience, address, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)
    `).run(id, body.full_name || body.name || '', body.email || '', body.phone || '', body.role || 'Artisan', body.experience || '', body.address || '', body.notes || '', new Date().toISOString());
    return sendJson(200, { success: true });
  }

  // Form Submissions: Partnerships
  if (pathname === '/api/partnerships' && req.method === 'POST') {
    const body = await parseJsonBody();
    const id = `part-${crypto.randomUUID()}`;
    db.prepare(`
      INSERT INTO partnerships (id, company_name, contact_person, email, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'new', ?)
    `).run(id, body.company_name || '', body.contact_person || '', body.email || '', body.message || '', new Date().toISOString());
    return sendJson(200, { success: true });
  }

  // Admin Data Endpoints (Protected)
  if (pathname === '/api/admin/metrics' && req.method === 'GET') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });

    const totalEnquiries = db.prepare('SELECT COUNT(*) as c FROM enquiries').get().c;
    const newEnquiries = db.prepare("SELECT COUNT(*) as c FROM enquiries WHERE status = 'new'").get().c;
    const totalApplications = db.prepare('SELECT COUNT(*) as c FROM worker_applications').get().c;
    const newApplications = db.prepare("SELECT COUNT(*) as c FROM worker_applications WHERE status = 'new'").get().c;
    const approvedReviews = db.prepare("SELECT COUNT(*) as c FROM reviews WHERE status = 'approved'").get().c;
    const totalGallery = db.prepare('SELECT COUNT(*) as c FROM gallery_items').get().c;

    return sendJson(200, { totalEnquiries, newEnquiries, totalApplications, newApplications, approvedReviews, totalGallery });
  }

  if (pathname === '/api/admin/enquiries' && req.method === 'GET') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const list = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
    return sendJson(200, list);
  }

  if (pathname.startsWith('/api/admin/enquiries/') && req.method === 'PATCH') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const id = pathname.replace('/api/admin/enquiries/', '');
    const body = await parseJsonBody();
    db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(body.status, id);
    logAudit(admin.email, 'UPDATE_ENQUIRY', `Updated enquiry ${id} status to ${body.status}`, clientIp);
    return sendJson(200, { success: true });
  }

  if (pathname === '/api/admin/applications' && req.method === 'GET') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const list = db.prepare('SELECT * FROM worker_applications ORDER BY created_at DESC').all();
    return sendJson(200, list);
  }

  if (pathname.startsWith('/api/admin/applications/') && req.method === 'PATCH') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const id = pathname.replace('/api/admin/applications/', '');
    const body = await parseJsonBody();
    db.prepare('UPDATE worker_applications SET status = ? WHERE id = ?').run(body.status, id);
    logAudit(admin.email, 'UPDATE_APPLICATION', `Updated application ${id} status to ${body.status}`, clientIp);
    return sendJson(200, { success: true });
  }

  if (pathname === '/api/admin/reviews' && req.method === 'GET') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const list = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
    return sendJson(200, list);
  }

  if (pathname.startsWith('/api/admin/reviews/') && req.method === 'PATCH') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const id = pathname.replace('/api/admin/reviews/', '');
    const body = await parseJsonBody();
    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(body.status, id);
    logAudit(admin.email, 'UPDATE_REVIEW', `Updated review ${id} status to ${body.status}`, clientIp);
    return sendJson(200, { success: true });
  }

  if (pathname === '/api/admin/gallery' && req.method === 'GET') {
    const list = db.prepare('SELECT * FROM gallery_items ORDER BY created_at DESC').all();
    return sendJson(200, list);
  }

  if (pathname === '/api/admin/gallery' && req.method === 'POST') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const body = await parseJsonBody();
    const id = `gal-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO gallery_items (id, title, description, type, url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, body.title, body.description, body.type || 'image', body.url, now, now);
    logAudit(admin.email, 'ADD_GALLERY_ITEM', `Added gallery project: ${body.title}`, clientIp);
    return sendJson(200, { success: true, id });
  }

  if (pathname.startsWith('/api/admin/gallery/') && req.method === 'DELETE') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const id = pathname.replace('/api/admin/gallery/', '');
    db.prepare('DELETE FROM gallery_items WHERE id = ?').run(id);
    logAudit(admin.email, 'DELETE_GALLERY_ITEM', `Deleted gallery item ${id}`, clientIp);
    return sendJson(200, { success: true });
  }

  if (pathname === '/api/admin/audit-logs' && req.method === 'GET') {
    const admin = getSessionAdmin(req);
    if (!admin) return sendJson(403, { error: 'Unauthorized' });
    const list = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all();
    return sendJson(200, list);
  }

  // ---------------------------------------------------------------------------
  // STATIC FILE SERVING
  // ---------------------------------------------------------------------------
  let filePath = pathname;
  if (filePath === '/') filePath = '/index.html';
  else if (filePath === '/services') filePath = '/services.html';
  else if (filePath === '/reviews') filePath = '/reviews.html';
  else if (filePath === '/work-with-us') filePath = '/work-with-us.html';
  else if (filePath === '/partnerships') filePath = '/partnerships.html';
  else if (filePath === '/contact') filePath = '/contact.html';
  else if (filePath === '/admin') filePath = '/admin.html';

  const fullPath = path.join(process.cwd(), filePath);

  // Safety check: ensure request does not escape root
  if (!fullPath.startsWith(process.cwd())) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(fullPath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GISTIC Services Server running on http://localhost:${PORT}`);
  console.log(`🛡️  Admin Desk available at: http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});

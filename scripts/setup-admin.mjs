#!/usr/bin/env node
/**
 * GISTIC Services - Secure Admin Password Setup Tool
 * 
 * Usage:
 *   node scripts/setup-admin.mjs --email=chiedozieonyekwelu989@gmail.com --password="YourStrongPassword!123"
 *   node scripts/setup-admin.mjs --email=gisticservice@gmail.com --password="YourStrongPassword!123"
 * 
 * Or interactive mode:
 *   node scripts/setup-admin.mjs
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';

const ALLOWED_ADMINS = [
  'chiedozieonyekwelu989@gmail.com',
  'gisticservice@gmail.com'
];

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'gistic.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

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

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TEXT NOT NULL
  );
`);

function validatePassword(pwd) {
  if (!pwd || pwd.length < 10) return 'Password must be at least 10 characters.';
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter (A-Z).';
  if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter (a-z).';
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number (0-9).';
  if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character (!@#$%^&*).';
  return null;
}

const args = process.argv.slice(2);
const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1]?.trim()?.toLowerCase();
const pwdArg = args.find(a => a.startsWith('--password='))?.split('=')[1]?.trim();

async function main() {
  console.log('\n======================================================');
  console.log('🛡️  GISTIC SERVICES - SECURE ADMIN ACCOUNT SETUP');
  console.log('======================================================\n');

  let email = emailArg;
  let password = pwdArg;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  if (!email) {
    console.log('Authorized Administrator Accounts:');
    ALLOWED_ADMINS.forEach((adm, idx) => console.log(`  [${idx + 1}] ${adm}`));
    const choice = (await question('\nSelect admin account (1 or 2, or enter email): ')).trim();
    
    if (choice === '1') email = ALLOWED_ADMINS[0];
    else if (choice === '2') email = ALLOWED_ADMINS[1];
    else email = choice.toLowerCase();
  }

  if (!ALLOWED_ADMINS.includes(email)) {
    console.error(`\n❌ Access Denied: Email "${email}" is NOT authorized on the administrator allowlist.`);
    rl.close();
    process.exit(1);
  }

  if (!password) {
    console.log('\nPassword Requirements:');
    console.log(' • At least 10 characters');
    console.log(' • 1 uppercase (A-Z) & 1 lowercase (a-z)');
    console.log(' • 1 number (0-9) & 1 special character (!@#$%^&*)');
    console.log(' • Unique password (do not reuse your personal Google password)\n');

    password = (await question('Enter new password: ')).trim();
    const confirm = (await question('Confirm new password: ')).trim();

    if (password !== confirm) {
      console.error('\n❌ Error: Passwords do not match.');
      rl.close();
      process.exit(1);
    }
  }

  const error = validatePassword(password);
  if (error) {
    console.error(`\n❌ Error: ${error}`);
    rl.close();
    process.exit(1);
  }

  console.log('\nHashing password securely with bcrypt (12 rounds)...');
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);

  if (existing) {
    db.prepare('UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, now, existing.id);
  } else {
    db.prepare(`
      INSERT INTO admins (id, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 'admin', 1, ?, ?)
    `).run(crypto.randomUUID(), email, hash, now, now);
  }

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (id, admin_email, action, details, ip_address, created_at)
    VALUES (?, ?, 'PASSWORD_SETUP', 'Admin password established via CLI tool', 'cli', ?)
  `).run(crypto.randomUUID(), email, now);

  console.log(`\n✅ SUCCESS: Strong password established for ${email}!`);
  console.log(`You can now log in at: http://localhost:3000/work-with-us.html or http://localhost:3000/admin.html`);
  console.log('======================================================\n');

  rl.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

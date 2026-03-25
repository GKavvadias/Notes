import { Database, type SQLQueryBindings } from "bun:sqlite";
import { mkdirSync } from "fs";
import path from "path";

const dbPath = process.env.DB_PATH ?? "data/app.db";

// Ensure the directory exists
mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath, { create: true });

db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");

// ── better-auth tables ────────────────────────────────────────────────────────

db.run(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    idToken TEXT,
    password TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// ── App table ─────────────────────────────────────────────────────────────────

db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_json TEXT NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 0,
    public_slug TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES user(id)
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public)`);

// ── Query helpers ─────────────────────────────────────────────────────────────

type SQLParams = SQLQueryBindings[] | SQLQueryBindings;

export function query<T>(sql: string, params?: SQLParams): T[] {
  if (!params || (Array.isArray(params) && params.length === 0)) {
    return db.query<T, []>(sql).all();
  }
  if (Array.isArray(params)) {
    return db.query<T, SQLQueryBindings[]>(sql).all(...params);
  }
  return db.query<T, SQLQueryBindings>(sql).all(params);
}

export function get<T>(sql: string, params?: SQLParams): T | undefined {
  if (!params || (Array.isArray(params) && params.length === 0)) {
    return db.query<T, []>(sql).get() ?? undefined;
  }
  if (Array.isArray(params)) {
    return db.query<T, SQLQueryBindings[]>(sql).get(...params) ?? undefined;
  }
  return db.query<T, SQLQueryBindings>(sql).get(params) ?? undefined;
}

export function run(sql: string, params?: SQLParams): void {
  if (!params || (Array.isArray(params) && params.length === 0)) {
    db.query(sql).run();
    return;
  }
  if (Array.isArray(params)) {
    db.query<unknown, SQLQueryBindings[]>(sql).run(...params);
    return;
  }
  db.query<unknown, SQLQueryBindings>(sql).run(params);
}

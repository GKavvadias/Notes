import { get, query, run } from "./db";

export interface Note {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getNotesByUser(userId: string): Note[] {
  const rows = query<NoteRow>(
    "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
    [userId],
  );
  return rows.map(rowToNote);
}

export function deleteNotesByIds(ids: string[], userId: string): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(", ");
  run(
    `DELETE FROM notes WHERE id IN (${placeholders}) AND user_id = ?`,
    [...ids, userId],
  );
}

export function getNoteById(id: string, userId: string): Note | undefined {
  const row = get<NoteRow>("SELECT * FROM notes WHERE id = ? AND user_id = ?", [id, userId]);
  return row ? rowToNote(row) : undefined;
}

export function deleteNoteById(id: string, userId: string): void {
  run("DELETE FROM notes WHERE id = ? AND user_id = ?", [id, userId]);
}

export function updateNote(
  id: string,
  userId: string,
  data: { title: string; contentJson: string },
): Note | undefined {
  const now = new Date().toISOString();
  run(
    "UPDATE notes SET title = ?, content_json = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    [data.title, data.contentJson, now, id, userId],
  );
  return getNoteById(id, userId);
}

export function createNote(
  userId: string,
  data: { title: string; contentJson: string },
): Note {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  run(
    `INSERT INTO notes (id, user_id, title, content_json, is_public, public_slug, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, NULL, ?, ?)`,
    [id, userId, data.title, data.contentJson, now, now],
  );

  const row = get<NoteRow>("SELECT * FROM notes WHERE id = ?", [id]);
  if (!row) throw new Error("Failed to retrieve note after insert");

  return rowToNote(row);
}

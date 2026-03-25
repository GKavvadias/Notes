import { get, run } from "./db";

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

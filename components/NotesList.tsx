"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Note } from "@/lib/notes";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function NotesList({ notes }: { notes: Note[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selecting, setSelecting] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(selected.size === notes.length ? new Set() : new Set(notes.map((n) => n.id)));
  }

  function cancelSelecting() {
    setSelecting(false);
    setSelected(new Set());
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    setLoading(true);
    await fetch("/api/notes/bulk-delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    setLoading(false);
    cancelSelecting();
    router.refresh();
  }

  if (notes.length === 0) {
    return <p className="text-sm text-neutral-500">No notes yet. Create your first one!</p>;
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        {!selecting ? (
          <button
            onClick={() => setSelecting(true)}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Select
          </button>
        ) : (
          <>
            <button
              onClick={toggleSelectAll}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              {selected.size === notes.length ? "Deselect all" : "Select all"}
            </button>
            <button
              onClick={cancelSelecting}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Cancel
            </button>
            {selected.size > 0 && (
              <button
                onClick={deleteSelected}
                disabled={loading}
                className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting…" : `Delete (${selected.size})`}
              </button>
            )}
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => {
          const isSelected = selected.has(note.id);
          return selecting ? (
            <button
              key={note.id}
              onClick={() => toggleSelect(note.id)}
              className={`block w-full rounded-lg border p-4 text-left transition-shadow hover:shadow-md ${
                isSelected
                  ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950"
                  : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="mb-1 truncate font-medium text-neutral-900 dark:text-neutral-100">
                  {note.title}
                </h2>
                <span
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 ${
                    isSelected
                      ? "border-red-500 bg-red-500"
                      : "border-neutral-400 dark:border-neutral-600"
                  }`}
                />
              </div>
              <p className="text-xs text-neutral-500">{formatDate(note.updatedAt)}</p>
            </button>
          ) : (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
            >
              <h2 className="mb-1 truncate font-medium text-neutral-900 dark:text-neutral-100">
                {note.title}
              </h2>
              <p className="text-xs text-neutral-500">{formatDate(note.updatedAt)}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}

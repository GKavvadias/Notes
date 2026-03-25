"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useState } from "react";

const titleInputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-700";

const toolbarBtnClass =
  "rounded px-2 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 aria-pressed:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:aria-pressed:bg-neutral-700";

export function NewNoteForm(): React.ReactElement {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-48 outline-none prose prose-neutral dark:prose-invert max-w-none text-sm",
      },
    },
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleBold() {
    editor?.chain().focus().toggleBold().run();
  }
  function handleItalic() {
    editor?.chain().focus().toggleItalic().run();
  }
  function handleH1() {
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  }
  function handleH2() {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  }
  function handleH3() {
    editor?.chain().focus().toggleHeading({ level: 3 }).run();
  }
  function handleParagraph() {
    editor?.chain().focus().setParagraph().run();
  }
  function handleBulletList() {
    editor?.chain().focus().toggleBulletList().run();
  }
  function handleCode() {
    editor?.chain().focus().toggleCode().run();
  }
  function handleCodeBlock() {
    editor?.chain().focus().toggleCodeBlock().run();
  }
  function handleHorizontalRule() {
    editor?.chain().focus().setHorizontalRule().run();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editor) return;
    setError(null);
    setIsLoading(true);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        contentJson: JSON.stringify(editor.getJSON()),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Something went wrong.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="note-title"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Title
        </label>
        <input
          id="note-title"
          type="text"
          required
          value={title}
          onChange={handleTitleChange}
          className={titleInputClass}
          placeholder="Note title"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Content
        </span>

        <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700">
          {/* Toolbar */}
          <div
            role="toolbar"
            aria-label="Text formatting"
            className="flex flex-wrap gap-0.5 border-b border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <button
              type="button"
              aria-label="Bold"
              aria-pressed={editor?.isActive("bold") ?? false}
              onClick={handleBold}
              disabled={!editor}
              className={toolbarBtnClass}
            >
              B
            </button>
            <button
              type="button"
              aria-label="Italic"
              aria-pressed={editor?.isActive("italic") ?? false}
              onClick={handleItalic}
              disabled={!editor}
              className={`${toolbarBtnClass} italic`}
            >
              I
            </button>

            <div
              role="separator"
              aria-orientation="vertical"
              className="mx-1 w-px self-stretch bg-neutral-200 dark:bg-neutral-700"
            />

            <button
              type="button"
              aria-label="Heading 1"
              aria-pressed={editor?.isActive("heading", { level: 1 }) ?? false}
              onClick={handleH1}
              disabled={!editor}
              className={toolbarBtnClass}
            >
              H1
            </button>
            <button
              type="button"
              aria-label="Heading 2"
              aria-pressed={editor?.isActive("heading", { level: 2 }) ?? false}
              onClick={handleH2}
              disabled={!editor}
              className={toolbarBtnClass}
            >
              H2
            </button>
            <button
              type="button"
              aria-label="Heading 3"
              aria-pressed={editor?.isActive("heading", { level: 3 }) ?? false}
              onClick={handleH3}
              disabled={!editor}
              className={toolbarBtnClass}
            >
              H3
            </button>
            <button
              type="button"
              aria-label="Paragraph"
              aria-pressed={editor?.isActive("paragraph") ?? false}
              onClick={handleParagraph}
              disabled={!editor}
              className={toolbarBtnClass}
            >
              ¶
            </button>

            <div
              role="separator"
              aria-orientation="vertical"
              className="mx-1 w-px self-stretch bg-neutral-200 dark:bg-neutral-700"
            />

            <button
              type="button"
              aria-label="Bullet list"
              aria-pressed={editor?.isActive("bulletList") ?? false}
              onClick={handleBulletList}
              disabled={!editor}
              className={toolbarBtnClass}
            >
              • List
            </button>

            <div
              role="separator"
              aria-orientation="vertical"
              className="mx-1 w-px self-stretch bg-neutral-200 dark:bg-neutral-700"
            />

            <button
              type="button"
              aria-label="Inline code"
              aria-pressed={editor?.isActive("code") ?? false}
              onClick={handleCode}
              disabled={!editor}
              className={`${toolbarBtnClass} font-mono`}
            >
              &lt;&gt;
            </button>
            <button
              type="button"
              aria-label="Code block"
              aria-pressed={editor?.isActive("codeBlock") ?? false}
              onClick={handleCodeBlock}
              disabled={!editor}
              className={`${toolbarBtnClass} font-mono`}
            >
              {"</>"}
            </button>

            <div
              role="separator"
              aria-orientation="vertical"
              className="mx-1 w-px self-stretch bg-neutral-200 dark:bg-neutral-700"
            />

            <button
              type="button"
              aria-label="Horizontal rule"
              onClick={handleHorizontalRule}
              disabled={!editor}
              className={toolbarBtnClass}
            >
              ─
            </button>
          </div>

          {/* Editor */}
          <div className="bg-white px-4 py-3 dark:bg-neutral-900">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !editor}
          className="cursor-pointer rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {isLoading ? "Saving…" : "Save note"}
        </button>
      </div>
    </form>
  );
}

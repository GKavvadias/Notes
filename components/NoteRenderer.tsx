import type { ReactElement, ReactNode } from "react";

interface TextMark {
  type: "bold" | "italic" | "code";
}

interface TipTapText {
  type: "text";
  text: string;
  marks?: TextMark[];
}

interface TipTapHardBreak {
  type: "hardBreak";
}

type InlineNode = TipTapText | TipTapHardBreak;

interface TipTapParagraph {
  type: "paragraph";
  content?: InlineNode[];
}

interface TipTapHeading {
  type: "heading";
  attrs: { level: 1 | 2 | 3 };
  content?: InlineNode[];
}

interface TipTapBulletList {
  type: "bulletList";
  content?: TipTapListItem[];
}

interface TipTapListItem {
  type: "listItem";
  content?: TipTapParagraph[];
}

interface TipTapCodeBlock {
  type: "codeBlock";
  content?: TipTapText[];
}

interface TipTapHorizontalRule {
  type: "horizontalRule";
}

type BlockNode =
  | TipTapParagraph
  | TipTapHeading
  | TipTapBulletList
  | TipTapCodeBlock
  | TipTapHorizontalRule;

interface TipTapDoc {
  type: "doc";
  content?: BlockNode[];
}

function renderInline(nodes: InlineNode[] = []): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === "hardBreak") return <br key={i} />;
    let content: ReactNode = node.text;
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") content = <strong key={i}>{content}</strong>;
        else if (mark.type === "italic") content = <em key={i}>{content}</em>;
        else if (mark.type === "code")
          content = (
            <code
              key={i}
              className="rounded bg-neutral-100 px-1 font-mono text-sm dark:bg-neutral-800"
            >
              {content}
            </code>
          );
      }
    }
    return <span key={i}>{content}</span>;
  });
}

function renderBlock(node: BlockNode, i: number): ReactElement {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={i} className="mb-3 leading-relaxed text-neutral-800 dark:text-neutral-200">
          {renderInline(node.content)}
        </p>
      );
    case "heading": {
      const cls =
        node.attrs.level === 1
          ? "mb-4 mt-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100"
          : node.attrs.level === 2
            ? "mb-3 mt-5 text-xl font-semibold text-neutral-900 dark:text-neutral-100"
            : "mb-2 mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100";
      const Tag = `h${node.attrs.level}` as "h1" | "h2" | "h3";
      return (
        <Tag key={i} className={cls}>
          {renderInline(node.content)}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={i} className="mb-3 list-disc pl-6 text-neutral-800 dark:text-neutral-200">
          {(node.content ?? []).map((item, j) => (
            <li key={j}>{renderInline(item.content?.[0]?.content)}</li>
          ))}
        </ul>
      );
    case "codeBlock":
      return (
        <pre
          key={i}
          className="mb-3 overflow-x-auto rounded-lg bg-neutral-100 p-4 font-mono text-sm dark:bg-neutral-800"
        >
          <code>{(node.content ?? []).map((n) => n.text).join("")}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={i} className="my-4 border-neutral-200 dark:border-neutral-700" />;
  }
}

export function NoteRenderer({ contentJson }: { contentJson: string }) {
  const doc: TipTapDoc = JSON.parse(contentJson);
  return (
    <div className="prose-neutral max-w-none">
      {(doc.content ?? []).map((node, i) => renderBlock(node, i))}
    </div>
  );
}

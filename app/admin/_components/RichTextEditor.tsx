"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { readFileAsDataUrl, uploadAdminImage } from "@/lib/admin";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * TipTap-based WYSIWYG. Outputs HTML — the storefront blog page renders it
 * directly with `dangerouslySetInnerHTML`, on the assumption that admin
 * authors are trusted. The editor is initialised from `value` on mount and
 * only re-syncs externally when `value` diverges from the editor's own HTML
 * by more than whitespace, so external state updates don't clobber the
 * user's cursor mid-typing.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  minHeight = "20rem",
}: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Link is added as its own extension below so we can configure
        // openOnClick + rel attributes; keep StarterKit's bundled link off.
        link: false,
      }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      ImageExt.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded border border-slate-200 max-w-full",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    immediatelyRender: false, // SSR-safe — Next.js renders this on the client
    editorProps: {
      attributes: {
        // `prose` utility classes give the editor a sensible default look;
        // the matching set is applied on the storefront blog page.
        class:
          "prose prose-slate max-w-none focus:outline-none px-4 py-3 text-sm leading-relaxed [&_a]:text-blue-600 [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:list-disc [&_li]:ml-6 [&_ol_li]:list-decimal [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:text-slate-100 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // External value updates (e.g., loading an existing post). Skip if it
  // matches what's already in the editor to preserve cursor position.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value === current) return;
    // setContent without firing onUpdate so we don't bounce back the same
    // value (which would force a re-render with stale state).
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  const triggerImageUpload = () => fileRef.current?.click();

  const handleImageFile = async (file: File | undefined | null) => {
    if (!file || !editor) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      window.alert("Only PNG, JPEG, or WebP images are supported");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      window.alert("Image exceeds 8MB limit");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const { url } = await uploadAdminImage(dataUrl, "post-content");
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const promptLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  if (!editor) {
    return (
      <div
        className="rounded-md border border-slate-300 bg-slate-50"
        style={{ minHeight }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-300 focus-within:border-slate-900">
      <Toolbar
        editor={editor}
        onUploadImage={triggerImageUpload}
        onLink={promptLink}
      />
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => void handleImageFile(e.target.files?.[0])}
      />
    </div>
  );
}

function Toolbar({
  editor,
  onUploadImage,
  onLink,
}: {
  editor: Editor;
  onUploadImage: () => void;
  onLink: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <Group>
        <Btn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          H2
        </Btn>
        <Btn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          H3
        </Btn>
        <Btn
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Paragraph"
        >
          ¶
        </Btn>
      </Group>
      <Sep />
      <Group>
        <Btn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <span className="font-bold">B</span>
        </Btn>
        <Btn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <span className="italic">I</span>
        </Btn>
        <Btn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </Btn>
        <Btn
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <span className="font-mono text-xs">{"<>"}</span>
        </Btn>
      </Group>
      <Sep />
      <Group>
        <Btn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          •
        </Btn>
        <Btn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          1.
        </Btn>
        <Btn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          ❝
        </Btn>
        <Btn
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        >
          {"{ }"}
        </Btn>
      </Group>
      <Sep />
      <Group>
        <Btn
          active={editor.isActive("link")}
          onClick={onLink}
          title="Add or edit link"
        >
          🔗
        </Btn>
        <Btn onClick={onUploadImage} title="Insert image">
          🖼
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          —
        </Btn>
      </Group>
      <Sep />
      <Group>
        <Btn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          ↶
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          ↷
        </Btn>
      </Group>
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Sep() {
  return <div className="mx-1 h-5 w-px bg-slate-200" />;
}

function Btn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-sm transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-200"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

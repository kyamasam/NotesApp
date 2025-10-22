"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Plus,
  Minus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: TipTapEditorProps) {
  const [fontSize, setFontSize] = useState<number>(14);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[500px] p-6",
        style: "font-family: var(--font-virgil)",
      },
    },
  });

  // Update editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  // Detect if user is on Mac
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
  const mod = isMac ? "⌘" : "Ctrl";

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const undo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const redo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

  const increaseFontSize = useCallback(() => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (currentIndex < fontSizes.length - 1) {
      setFontSize(fontSizes[currentIndex + 1]);
    }
  }, [fontSize, fontSizes]);

  const decreaseFontSize = useCallback(() => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(fontSizes[currentIndex - 1]);
    }
  }, [fontSize, fontSizes]);

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-600">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-300 bg-white">
        <button
          onClick={undo}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={`Undo (${mod}+Z)`}
        >
          <Undo className="w-5 h-5 text-gray-800" />
        </button>
        <button
          onClick={redo}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={`Redo (${mod}+Y)`}
        >
          <Redo className="w-5 h-5 text-gray-800" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={toggleBold}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive("bold") ? "bg-blue-100" : ""
          }`}
          title={`Bold (${mod}+B)`}
        >
          <Bold className="w-5 h-5 text-gray-800" />
        </button>
        <button
          onClick={toggleItalic}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive("italic") ? "bg-blue-100" : ""
          }`}
          title={`Italic (${mod}+I)`}
        >
          <Italic className="w-5 h-5 text-gray-800" />
        </button>
        <button
          onClick={toggleStrike}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive("strike") ? "bg-blue-100" : ""
          }`}
          title={`Strikethrough (${mod}+Shift+S)`}
        >
          <Strikethrough className="w-5 h-5 text-gray-800" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={toggleBulletList}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive("bulletList") ? "bg-blue-100" : ""
          }`}
          title={`Bullet List (${mod}+Shift+8)`}
        >
          <List className="w-5 h-5 text-gray-800" />
        </button>
        <button
          onClick={toggleOrderedList}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive("orderedList") ? "bg-blue-100" : ""
          }`}
          title={`Numbered List (${mod}+Shift+7)`}
        >
          <ListOrdered className="w-5 h-5 text-gray-800" />
        </button>
        <button
          onClick={toggleBlockquote}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive("blockquote") ? "bg-blue-100" : ""
          }`}
          title={`Quote (${mod}+Shift+B)`}
        >
          <Quote className="w-5 h-5 text-gray-800" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={decreaseFontSize}
          disabled={fontSizes.indexOf(fontSize) === 0}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Decrease Font Size"
        >
          <Minus className="w-5 h-5 text-gray-800" />
        </button>
        <span className="px-2 text-sm text-gray-600 min-w-[40px] text-center font-mono">
          {fontSize}
        </span>
        <button
          onClick={increaseFontSize}
          disabled={fontSizes.indexOf(fontSize) === fontSizes.length - 1}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Increase Font Size"
        >
          <Plus className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto bg-white">
        <style>{`
          .ProseMirror {
            color: #1f2937;
          }
          .ProseMirror p {
            margin: 0.75em 0;
          }
          .ProseMirror h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 1em 0 0.5em;
            color: #111827;
          }
          .ProseMirror h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.83em 0 0.5em;
            color: #111827;
          }
          .ProseMirror h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin: 1em 0 0.5em;
            color: #111827;
          }
          .ProseMirror ul {
            padding-left: 1.5em;
            margin: 0.75em 0;
            list-style-type: disc;
          }
          .ProseMirror ol {
            padding-left: 1.5em;
            margin: 0.75em 0;
            list-style-type: decimal;
          }
          .ProseMirror ul li, .ProseMirror ol li {
            display: list-item;
          }
          .ProseMirror blockquote {
            border-left: 3px solid #d1d5db;
            padding-left: 1em;
            margin: 1em 0;
            color: #4b5563;
          }
          .ProseMirror strong {
            font-weight: bold;
          }
          .ProseMirror em {
            font-style: italic;
          }
          .ProseMirror:focus {
            outline: none;
          }
        `}</style>
        <EditorContent
          editor={editor}
          className="h-full"
          style={{ fontSize: `${fontSize}px` }}
        />
      </div>
    </div>
  );
}

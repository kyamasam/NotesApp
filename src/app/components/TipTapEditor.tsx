"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight } from "lowlight";
import {
  Bold,
  ChevronDown,
  Code,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [showActionPalette, setShowActionPalette] = useState(false);
  const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });
  const highlightRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const lowlight = createLowlight();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // Disable default code block to use lowlight version
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
        HTMLAttributes: {
          class: "code-block",
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

  // Close highlight color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        highlightRef.current &&
        !highlightRef.current.contains(event.target as Node)
      ) {
        setShowHighlightColors(false);
      }
      if (
        paletteRef.current &&
        !paletteRef.current.contains(event.target as Node)
      ) {
        setShowActionPalette(false);
      }
    };

    if (showHighlightColors || showActionPalette) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHighlightColors, showActionPalette]);

  // Handle text selection for action palette
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editor) return;

      const { from, to, empty } = editor.state.selection;

      if (empty) {
        setShowActionPalette(false);
        return;
      }

      // Get the DOM selection to calculate position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPalettePosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 50, // Position above the selection
        });
        setShowActionPalette(true);
      }
    };

    if (editor) {
      editor.on("selectionUpdate", handleSelectionChange);
    }

    return () => {
      if (editor) {
        editor.off("selectionUpdate", handleSelectionChange);
      }
    };
  }, [editor]);

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

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  const undo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const redo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

  const highlightColors = [
    { name: "Yellow", color: "#fff59d" },
    { name: "Green", color: "#c8e6c9" },
    { name: "Blue", color: "#bbdefb" },
    { name: "Pink", color: "#f8bbd9" },
    { name: "Orange", color: "#ffcc80" },
    { name: "Purple", color: "#e1bee7" },
  ];

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

  const toggleHighlight = useCallback(
    (color?: string) => {
      if (!editor) return;

      if (color) {
        editor.chain().focus().toggleHighlight({ color }).run();
      } else {
        editor.chain().focus().toggleHighlight().run();
      }
      setShowHighlightColors(false);
    },
    [editor]
  );

  const removeHighlight = useCallback(() => {
    editor?.chain().focus().unsetHighlight().run();
    setShowHighlightColors(false);
  }, [editor]);

  const applyHighlightFromPalette = useCallback(
    (color: string) => {
      if (!editor) return;

      // First ensure we maintain the selection
      const { from, to } = editor.state.selection;

      // Apply highlight with color
      editor
        .chain()
        .setTextSelection({ from, to })
        .toggleHighlight({ color })
        .run();

      setShowHighlightColors(false);
      setShowActionPalette(false);
    },
    [editor]
  );

  const removeHighlightFromPalette = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    editor.chain().setTextSelection({ from, to }).unsetHighlight().run();

    setShowHighlightColors(false);
    setShowActionPalette(false);
  }, [editor]);

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

        <div className="relative" ref={highlightRef}>
          <button
            onClick={() => setShowHighlightColors(!showHighlightColors)}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center ${
              editor.isActive("highlight") ? "bg-blue-100" : ""
            }`}
            title="Highlight Text"
          >
            <Highlighter className="w-5 h-5 text-gray-800" />
            <ChevronDown className="w-3 h-3 text-gray-800 ml-1" />
          </button>

          {showHighlightColors && (
            <div className="absolute top-10 left-0 bg-white border border-gray-300 rounded shadow-lg z-10 p-2">
              <div className="grid grid-cols-3 gap-2 min-w-[120px]">
                {highlightColors.map((highlight) => (
                  <button
                    key={highlight.name}
                    onClick={() => toggleHighlight(highlight.color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: highlight.color }}
                    title={`Highlight ${highlight.name}`}
                  />
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <button
                  onClick={removeHighlight}
                  className="text-xs px-2 py-1 hover:bg-gray-100 rounded w-full text-gray-700"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

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
        <button
          onClick={toggleCodeBlock}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            editor.isActive("codeBlock") ? "bg-blue-100" : ""
          }`}
          title="Code Block"
        >
          <Code className="w-5 h-5 text-gray-800" />
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
          .ProseMirror pre {
            background: #282a39;
            color: #d4d4d4;
            font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
            // padding: 0.75rem 1rem;
            // border-radius: 0.5rem;
            overflow-x: auto;
            // margin: 1rem 0;
            // border: 1px solid #333;
            line-height: 1.4;
          }
          .ProseMirror pre code {
            color: inherit;
            padding: 0;
            background: none;
            font-size: 0.875rem;
            line-height: 1.4;
            display: block;
            white-space: pre;
          }
          .ProseMirror pre.code-block {
            counter-reset: none;
          }
          .ProseMirror pre.code-block * {
            list-style: none !important;
          }
          .ProseMirror pre.code-block p {
            display: inline !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .ProseMirror pre.code-block br {
            display: none !important;
          }
          .ProseMirror .hljs {
            background: transparent !important;
          }
          .ProseMirror code {
            background: #f3f4f6;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
            color: #dc2626;
          }
        `}</style>
        <EditorContent
          editor={editor}
          className="h-full"
          style={{ fontSize: `${fontSize}px` }}
        />
      </div>

      {/* Action Palette */}
      {showActionPalette && (
        <div
          ref={paletteRef}
          className="fixed bg-white border border-gray-300 rounded shadow-lg z-50 p-1 flex gap-1"
          style={{
            left: `${palettePosition.x}px`,
            top: `${palettePosition.y}px`,
            transform: "translateX(-50%)",
          }}
        >
          <button
            onClick={toggleBold}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("bold") ? "bg-blue-100" : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4 text-gray-800" />
          </button>

          <button
            onClick={toggleStrike}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              editor.isActive("strike") ? "bg-blue-100" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4 text-gray-800" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowHighlightColors(!showHighlightColors)}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive("highlight") ? "bg-blue-100" : ""
              }`}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4 text-gray-800" />
            </button>

            {showHighlightColors && (
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded shadow-lg z-[60] p-2">
                <div className="grid grid-cols-3 gap-2 min-w-[120px]">
                  {highlightColors.map((highlight) => (
                    <button
                      key={highlight.name}
                      onClick={() => applyHighlightFromPalette(highlight.color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: highlight.color }}
                      title={`Highlight ${highlight.name}`}
                    />
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={removeHighlightFromPalette}
                    className="text-xs px-2 py-1 hover:bg-gray-100 rounded w-full text-gray-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

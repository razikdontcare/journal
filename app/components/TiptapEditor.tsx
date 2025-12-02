import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import { FileHandler } from "@tiptap/extension-file-handler";
import { common, createLowlight } from "lowlight";
import { useEffect, useCallback, useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Heading2,
  Heading3,
  Pilcrow,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  ImageIcon,
  Youtube as YoutubeIcon,
  Table2,
  Plus,
  Trash2,
  Undo,
  Redo,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";

const lowlight = createLowlight(common);

// Upload image to S3 via API
async function uploadImageToS3(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Upload error:", error);
    alert(error instanceof Error ? error.message : "Failed to upload image");
    return null;
  }
}

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function MenuBar({
  editor,
  onUploadImage,
}: {
  editor: Editor | null;
  onUploadImage: (file: File) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt(
      "Enter image URL (or click Cancel to upload a file):"
    );

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    } else if (url === null) {
      // User cancelled, offer file upload
      fileInputRef.current?.click();
    }
  }, [editor]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      await onUploadImage(file);
      setIsUploading(false);

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onUploadImage]
  );

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter YouTube URL:");

    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="editor-toolbar">
      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "active" : ""}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "active" : ""}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "active" : ""}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "active" : ""}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive("highlight") ? "active" : ""}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Subscript/Superscript */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={editor.isActive("subscript") ? "active" : ""}
          title="Subscript"
        >
          <SubscriptIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "active" : ""}
          title="Superscript"
        >
          <SuperscriptIcon size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Headings */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={editor.isActive("heading", { level: 3 }) ? "active" : ""}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "active" : ""}
          title="Paragraph"
        >
          <Pilcrow size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Text Alignment */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Lists */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "active" : ""}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "active" : ""}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Blocks */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "active" : ""}
          title="Quote"
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "active" : ""}
          title="Code Block"
        >
          <Code size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Link & Media */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={addLink}
          className={editor.isActive("link") ? "active" : ""}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={addImage}
          title="Add Image (URL or Upload)"
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImageIcon size={16} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={addYoutubeVideo}
          title="Add YouTube Video"
        >
          <YoutubeIcon size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Table */}
      <div className="toolbar-group">
        <button type="button" onClick={addTable} title="Insert Table">
          <Table2 size={16} />
        </button>
        {editor.isActive("table") && (
          <>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add Column"
            >
              <Plus size={14} />
              Col
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add Row"
            >
              <Plus size={14} />
              Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete Table"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );
}

export function TiptapEditor({
  content,
  onChange,
  placeholder,
}: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File, editor: Editor) => {
    setIsUploading(true);
    try {
      const url = await uploadImageToS3(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        codeBlock: false, // Disable default, use CodeBlockLowlight instead
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your article...",
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      CharacterCount,
      FileHandler.configure({
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ],
        onDrop: (currentEditor, files, pos) => {
          files.forEach(async (file) => {
            setIsUploading(true);
            try {
              const url = await uploadImageToS3(file);
              if (url) {
                currentEditor
                  .chain()
                  .focus()
                  .insertContentAt(pos, {
                    type: "image",
                    attrs: { src: url },
                  })
                  .run();
              }
            } finally {
              setIsUploading(false);
            }
          });
        },
        onPaste: (currentEditor, files) => {
          files.forEach(async (file) => {
            setIsUploading(true);
            try {
              const url = await uploadImageToS3(file);
              if (url) {
                currentEditor.chain().focus().setImage({ src: url }).run();
              }
            } finally {
              setIsUploading(false);
            }
          });
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Wrap upload function for MenuBar
  const onUploadImage = useCallback(
    async (file: File) => {
      if (editor) {
        await handleImageUpload(file, editor);
      }
    },
    [editor, handleImageUpload]
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const characterCount = editor?.storage.characterCount;

  return (
    <div className={`tiptap-editor ${isFullscreen ? "fullscreen" : ""}`}>
      {isUploading && (
        <div className="editor-upload-indicator">Uploading image...</div>
      )}
      <div className="editor-toolbar-wrapper">
        <MenuBar editor={editor} onUploadImage={onUploadImage} />
        <button
          type="button"
          className="fullscreen-toggle"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>
      <EditorContent editor={editor} />
      {characterCount && (
        <div className="editor-footer">
          <span>{characterCount.characters()} characters</span>
          <span>·</span>
          <span>{characterCount.words()} words</span>
          <span>·</span>
          <span>~{Math.ceil(characterCount.words() / 200)} min read</span>
        </div>
      )}
    </div>
  );
}

"use client"

import * as React from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/components/utils"

export type NotesRichEditorProps = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function NotesRichEditor({ content, onChange, placeholder = "", className }: NotesRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "notes-editor tiptap min-h-[180px] max-w-none px-3 py-2 text-sm leading-relaxed text-foreground outline-none",
          "focus:outline-none",
          "[&_p]:my-2 [&_li]:my-0.5",
          "[&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold",
          "[&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-semibold",
          "[&_a]:text-primary [&_a]:underline",
          "[&_blockquote]:my-2 [&_blockquote]:border-s-2 [&_blockquote]:border-muted-foreground/40 [&_blockquote]:ps-3 [&_blockquote]:italic",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-6",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-6"
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  React.useEffect(() => {
    if (!editor) return
    const incoming = content ?? ""
    const cur = editor.getHTML()
    if (incoming !== cur) {
      editor.commands.setContent(incoming, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) {
    return <div className={cn("min-h-[180px] animate-pulse rounded-lg border border-input bg-muted/40", className)} />
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-input bg-background",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/25 p-1">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("underline") ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Separator orientation="vertical" className="mx-0.5 h-6 shrink-0" />
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Heading"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Separator orientation="vertical" className="mx-0.5 h-6 shrink-0" />
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="icon-sm"
          className="size-8"
          aria-label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Separator orientation="vertical" className="mx-0.5 h-6 shrink-0" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8"
          aria-label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="size-3.5 text-foreground dark:text-white" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8"
          aria-label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="size-3.5 text-foreground dark:text-white" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

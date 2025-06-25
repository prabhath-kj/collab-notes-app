'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useImperativeHandle, forwardRef } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
}

// 👇 forwardRef allows parent to call .getHTML()
const NoteEditor = forwardRef((props: Props, ref) => {
  const { content, onChange } = props

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    autofocus: true,
    editable: true,
    editorProps: {
      attributes: {
        class: 'outline-none prose max-w-full min-h-[70vh]',
      },
    },
  })

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
  }))

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  return <EditorContent editor={editor} />
})

NoteEditor.displayName = 'NoteEditor'
export default NoteEditor

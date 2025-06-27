'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useImperativeHandle, forwardRef, useRef, useState } from 'react'
import debounce from 'lodash.debounce'
import {
  Bold, Italic, Heading1, List, ListOrdered, Quote, Undo2, Redo2
} from 'lucide-react'

import EditorButton from './EditorButton'
import { connectSocket } from '@/lib/socket'
import { shareNote } from '@/lib/actions/note.action'
import { useAuthStore } from '@/hooks/use.authStore'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface Props {
  content: string
  onChange: (html: string) => void
  onAutoSave?: (html: string) => void
  noteId: string
  role: 'owner' | 'editor' | 'viewer'
}

const NoteEditor = forwardRef((props: Props, ref) => {
  const { content, onChange, onAutoSave, noteId, role } = props
  const socket = connectSocket()
  const [emailToShare, setEmailToShare] = useState('')
  const [roleToShare, setRoleToShare] = useState<'editor' | 'viewer'>('viewer')
  const token = useAuthStore.getState().token
  const user = useAuthStore.getState().user

  const isReadOnly = role === 'viewer'

  // New for live collaboration
  const [onlineUsers, setOnlineUsers] = useState<{ name: string; email: string }[]>([])
  const [typingUser, setTypingUser] = useState<string>('')

  // Share functionality
  const handleShare = async () => {
    const res = await shareNote(token || '', noteId, emailToShare, roleToShare)
    if (res.success) {
      toast.success('Note shared!')
      setEmailToShare('')
    } else {
      toast.error(res.message)
    }
  }

  // Autosave
  const debouncedSave = useRef(
    debounce((html: string) => {
      if (onAutoSave && !isReadOnly) onAutoSave(html)
    }, 2000)
  ).current

  // Editor init
  const editor = useEditor({
    editable: !isReadOnly,
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      if (isReadOnly) return
      const html = editor.getHTML()
      onChange(html)
      debouncedSave(html)
      socket.emit('note-changed', { noteId, content: html })
      socket.emit('typing', { noteId, user: user?.name || 'Someone' })
    },
    autofocus: true,
    editorProps: {
      attributes: {
        class: 'outline-none prose max-w-full min-h-[70vh] px-2 py-4 focus:outline-none bg-white',
      },
    },
  })

  // Join room and listen for collab events
  useEffect(() => {
    if (!noteId) return
    socket.emit('join-note', noteId, { name: user?.name, email: user?.email })

    socket.on('user-list', (users) => {
      setOnlineUsers(users)
    })

    socket.on('user-typing', (userName) => {
      setTypingUser(userName)
      setTimeout(() => setTypingUser(''), 2000)
    })

    return () => {
      socket.off('user-list')
      socket.off('user-typing')
    }
  }, [noteId, user, socket])

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
  }))

  if (!editor) return null

  return (
    <div>
      {/* Online users */}
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
        <span className="font-medium">Active users:</span>
        {onlineUsers.length === 0 && <span>No one else here</span>}
        {onlineUsers.map((u, i) => (
          <span key={i} className="px-2 py-0.5 rounded bg-gray-100">{u.name}</span>
        ))}
      </div>

      {/* Typing */}
      {typingUser && (
        <div className="text-xs text-blue-500 mb-2">{typingUser} is typing...</div>
      )}

      {/* Toolbar */}
      {!isReadOnly && (
        <div className="flex flex-wrap gap-1 mb-4 border-b pb-2">
          <EditorButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold className="w-4 h-4" />} />
          <EditorButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic className="w-4 h-4" />} />
          <EditorButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={<Heading1 className="w-4 h-4" />} />
          <EditorButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<List className="w-4 h-4" />} />
          <EditorButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={<ListOrdered className="w-4 h-4" />} />
          <EditorButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={<Quote className="w-4 h-4" />} />
          <EditorButton active={false} onClick={() => editor.chain().focus().undo().run()} icon={<Undo2 className="w-4 h-4" />} />
          <EditorButton active={false} onClick={() => editor.chain().focus().redo().run()} icon={<Redo2 className="w-4 h-4" />} />
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Share Form (only for owner) */}
      {role === 'owner' && (
        <div className="mt-6 border-t pt-4 space-y-4">
          <h2 className="text-base font-semibold">Share this note</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
            <Input
              placeholder="Enter email"
              value={emailToShare}
              onChange={(e) => setEmailToShare(e.target.value)}
              className="sm:w-[250px]"
            />
            <Select value={roleToShare} onValueChange={(val) => setRoleToShare(val as 'editor' | 'viewer')}>
              <SelectTrigger className="sm:w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleShare} disabled={!emailToShare}>
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

NoteEditor.displayName = 'NoteEditor'
export default NoteEditor

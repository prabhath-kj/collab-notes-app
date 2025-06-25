'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getNoteById, updateNote } from '@/lib/actions/note.action'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import debounce from 'lodash.debounce'
import { useAuthStore } from '@/hooks/use.authStore'

const NoteEditor = dynamic(() => import('@/components/notes/NoteEditor'), {
    ssr: false,
})

export default function NoteEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const editorRef = useRef<{ getHTML: () => string }>(null)
    const token = useAuthStore.getState().token
    const [title, setTitle] = useState('')
    const [lastUpdated, setLastUpdated] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [content, setContent] = useState('<p>Loading...</p>')

    const debouncedSave = useRef(
        debounce(async (title: string, content: string) => {
            const res = await updateNote(token||"", id as string, { title, content })

            if (res.success) {
                setLastUpdated(new Date().toLocaleString())
                toast.success('Auto-saved')
            } else {
                toast.error(res.message)
            }
        }, 2000)
    ).current

    useEffect(() => {
        const fetchNote = async () => {
            const res = await getNoteById(token||"", id as string)

            if (!res.success) {
                toast.error(res.message)
                router.push('/')
                return
            }

            setTitle(res.note?.title || '')
            setContent(res.note?.content || '<p></p>')
            setLastUpdated(new Date(res.note?.updatedAt).toLocaleString())
        }

        fetchNote()
    }, [id])

    const handleSave = async () => {
        const htmlContent = editorRef.current?.getHTML() || ''
        setIsSaving(true)

        const res = await updateNote(token||"", id as string, {
            title,
            content: htmlContent,
        })

        if (res.success) {
            toast.success('Saved')
            setLastUpdated(new Date().toLocaleString())
        } else {
            toast.error(res.message)
        }

        setIsSaving(false)
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Topbar */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-white border-b">
                <Input
                    className="text-lg font-semibold border-none shadow-none focus:ring-0 w-1/2"
                    value={title}
                    onChange={(e) => {
                        const newTitle = e.target.value
                        setTitle(newTitle)
                        debouncedSave(newTitle, content)
                    }}
                    onBlur={handleSave}
                    placeholder="Untitled Document"
                />
                <div className="text-xs text-gray-500">Last edited: {lastUpdated}</div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </div>

            {/* Editor */}
            <div className="max-w-4xl mx-auto mt-8 bg-white p-8 min-h-[80vh] rounded shadow-sm">
                <NoteEditor
                    ref={editorRef}
                    content={content}
                    onChange={(html) => {
                        setContent(html)
                        debouncedSave(title, html)
                    }}
                />
            </div>
        </div>
    )
}

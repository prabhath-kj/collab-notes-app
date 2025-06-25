'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createNote, getMyNotes } from '@/lib/actions/note.action'
import { toast } from 'sonner'
import { Plus, LogOut, Search, Folder, List, SortAsc, MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/hooks/use.authStore'

interface Note {
    _id: string
    title: string
    updatedAt: string
}

export default function NotesDashboard() {
    const [notes, setNotes] = useState<Note[]>([])
    const [search, setSearch] = useState('')
    const router = useRouter()
    const token = useAuthStore.getState().token
    const logout = useAuthStore((s) => s.logout)

    useEffect(() => {
        const fetchNotes = async () => {
            const res = await getMyNotes(token || '')
            if (res.success) setNotes(res.notes)
            else toast.error(res.message)
        }
        fetchNotes()
    }, [])

    const handleNewNote = async () => {
        const res = await createNote(token || '', 'Untitled')
        if (res.success) router.push(`/notes/${res.note._id}`)
        else toast.error(res.message)
    }

    const handleLogout = () => {
        logout()
        router.push('/sign-in')

    }

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-white text-gray-800">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-4 sm:px-8 py-3 border-b shadow-sm sticky top-0 z-50 bg-white">
                <div className="flex items-center gap-2">
                    <Image src="/docs.png" alt="logo" width={30} height={30} />
                    <h1 className="text-lg font-semibold">Docs</h1>
                </div>

                <div className="relative w-full max-w-md hidden sm:block">
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 w-full text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded-full hover:bg-gray-100"
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Start New Document Section */}
            <section className="px-4 sm:px-8 py-6">
                <h2 className="text-sm text-gray-600 mb-2">Start a new document</h2>

                <div className="flex gap-4">
                    {/* Blank Document */}
                    <div
                        onClick={handleNewNote}
                        className="w-36 h-48 bg-white border  flex flex-col items-center cursor-pointer hover:shadow-md transition group"
                    >
                        <div className="w-full h-32 relative">
                            <Image
                                src="/docs-new.png"
                                alt="Blank Document"
                                fill
                                className="object-cover rounded-t-md"
                            />
                        </div>
                        <p className="text-sm mt-2 text-center">Blank document</p>
                    </div>

                    {/* Templates Placeholder */}
                    <div className="w-36 h-48 border rounded-md flex items-center justify-center text-sm text-gray-400">
                        More templates
                    </div>
                </div>
            </section>


            {/* Recent Documents Header */}
            <section className="px-4 sm:px-8 py-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm text-gray-600">Recent documents</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 hidden sm:block">Owned by me</span>
                        <SortAsc className="w-4 h-4 text-gray-500" />
                        <List className="w-4 h-4 text-gray-500" />
                        <Folder className="w-4 h-4 text-gray-500" />
                    </div>
                </div>

                {/* Notes Grid */}
                {filteredNotes.length === 0 ? (
                    <p className="text-sm text-gray-500">No documents found.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredNotes.map((note) => (
                            <Card
                                key={note._id}
                                className="h-48 w-36 border rounded-none cursor-pointer hover:shadow-sm transition flex flex-col justify-between"
                            >
                                {/* Preview Image or Blank Section */}
                                <div onClick={() => router.push(`/notes/${note._id}`)} className="h-48 bg-gray-100" />

                                {/* Bottom section */}
                                <div className="px-2 py-2 flex items-start justify-between text-sm">
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-medium truncate">
                                            {note.title || "Untitled"}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            Opened: {new Date(note.updatedAt).toLocaleDateString()}{" "}
                                            {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    {/* Dropdown menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 rounded-full hover:bg-gray-100">
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48">
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    // TODO: Open rename modal
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-600" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    // TODO: Delete note
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                Remove
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    window.open(`/notes/${note._id}`, '_blank')
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4 text-gray-600" />
                                                Open in new tab
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </Card>

                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

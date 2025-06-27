import { create } from 'zustand'

export interface Note {
  _id: string
  title: string
  content?: string
  updatedAt: string
}

interface NotesStore {
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  removeNote: (id: string) => void
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],

  setNotes: (notes) => set({ notes }),

  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),

  updateNote: (updated) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n._id === updated._id ? { ...n, ...updated } : n
      ),
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n._id !== id),
    })),
}))

import { createContext, useContext } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'

export const NotesContext = createContext({})

const notesStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'notes')

export function NotesProvider({ children }) {
    const [notes, setNotes] = useSyncedStorage(notesStorage)

    const value = {
        notes,
        setNotes,
    }

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    )
}

export function useNotes() {
    const context = useContext(NotesContext)
    return context.notes
}

export function useNote(id) {
    const context = useContext(NotesContext)
    return context.notes.find(t => t.id === id)
}

export function useSubjectNote(subjectId) {
    const context = useContext(NotesContext)
    return context.notes.find(t => t.subjectId === subjectId)
}

export function useAddNote() {
    const context = useContext(NotesContext)
    return (_note) => {
        const newID = Math.random().toString().split('.')[1]
        const note = {
            ..._note,
            id: `note:${newID}`,
        }
        context.setNotes([...context.notes, note])
    }
}
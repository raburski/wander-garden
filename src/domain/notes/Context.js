import { createContext, useContext, useState } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import EditNoteModal from "./EditNoteModal"

export const NotesContext = createContext({})

const notesStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'notes')

export function NotesProvider({ children }) {
    const [notes, setNotes] = useSyncedStorage(notesStorage)
    const [editingSubjectID, setEditingSubjectID] = useState()

    const value = {
        notes,
        setNotes,
        setEditingSubjectID,
    }

    return (
        <NotesContext.Provider value={value}>
            {children}
            {editingSubjectID ?
                <EditNoteModal
                    subjectId={editingSubjectID}
                    onCancel={() => setEditingSubjectID(undefined)}
                    onFinished={() => setEditingSubjectID(undefined)}
                />
             : null}
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
    if (!subjectId) return undefined
    return context.notes.find(t => t.subjectId === subjectId)
}

function getNewNoteID() {
    const newID = Math.random().toString().split('.')[1]
    return `note:${newID}`
}

export function useSaveNote() {
    const context = useContext(NotesContext)
    return (_note) => {
        
        const note = {
            ..._note,
            id: _note.id || getNewNoteID(),
        }
        context.setNotes([...context.notes, note])
    }
}

export function useEditSubjectNote() {
    const context = useContext(NotesContext)
    return (subjectId) => {
        context.setEditingSubjectID(subjectId)
    }
}
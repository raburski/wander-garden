import { createContext, useState, useContext, useMemo } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback, jsonTransforms } from 'storage'

export const StaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('stays', '[]', zipsonTransforms)
const initialLocalStorageStaysValue = localStorageStays.get()

export function StaysProvider({ children }) {
    const [stays, setStaysState] = useState(initialLocalStorageStaysValue)
    const setStays = useStatePersistedCallback(stays, setStaysState, localStorageStays.set.bind(localStorageStays))

    const value = useMemo(() => ({
        stays: [stays, setStays],
    }), [stays.length])

    return (
        <StaysContext.Provider value={value}>
            {children}
        </StaysContext.Provider>
    )
}

export function useStays() {
    const context = useContext(StaysContext)
    return context.stays
}

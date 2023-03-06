import { createContext, useContext, useMemo } from "react"
import { useSyncedStorage, IndexedDBStorageAdapter } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const AgodaStaysContext = createContext({})

const indexedDBStorageStays = new IndexedDBStorageAdapter([], 'wander-garden', 'agoda', 2)

export function AgodaStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(indexedDBStorageStays)

    const value = useMemo(() => ({
        stays: [stays, setStays],
    }), [stays.length])

    return (
        <AgodaStaysContext.Provider value={value}>
            {children}
        </AgodaStaysContext.Provider>
    )
}

export function useAgodaStays() {
    const context = useContext(AgodaStaysContext)
    return context.stays
}

export function useClearData() {
    const [_, setStays] = useAgodaStays()
    return () => setStays([])
}

export function isAgodaData(data) {
    return isArrayOfType(data, isStayType)
}
import { createContext, useContext, useMemo } from "react"
import { useSyncedStorage, IndexedDBStorageAdapter } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const AgodaStaysContext = createContext({})

export const agodaStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'agoda')

export function AgodaStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(agodaStaysStorage)

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
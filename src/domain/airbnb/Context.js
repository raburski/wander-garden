import { createContext, useContext, useMemo } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const AirbnbStaysContext = createContext({})

const indexedDBStorageStays = new IndexedDBStorageAdapter([], 'wander-garden', 'airbnb', 2)

export function AirbnbStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(indexedDBStorageStays)

    const value = useMemo(() => ({
        stays: [stays, setStays],
    }), [stays.length])

    return (
        <AirbnbStaysContext.Provider value={value}>
            {children}
        </AirbnbStaysContext.Provider>
    )
}

export function useAirbnbStays() {
    const context = useContext(AirbnbStaysContext)
    return context.stays
}

export function useClearData() {
    const [_, setStays] = useAirbnbStays()
    return () => setStays([])
}

export function isAirbnbData(data) {
    return isArrayOfType(data, isStayType)
}
import { createContext, useContext, useMemo } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const AirbnbStaysContext = createContext({})

export const airbnbStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'airbnb')

export function AirbnbStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(airbnbStaysStorage)

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
    return async function clearData() {
        await setStays([])
    }
}

export function isAirbnbData(data) {
    return isArrayOfType(data, isStayType)
}
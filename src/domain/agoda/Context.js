import { createContext, useState, useContext, useMemo, useEffect } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback, useSyncedStorage } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const AgodaStaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('agoda_stays', '[]', zipsonTransforms)

export function AgodaStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(localStorageStays)

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
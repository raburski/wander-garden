import { createContext, useState, useContext, useMemo } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback, useSyncedStorage } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const AirbnbStaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('airbnb_stays', '[]', zipsonTransforms)

export function AirbnbStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(localStorageStays)

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
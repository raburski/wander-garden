import { createContext, useState, useContext, useMemo } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'

export const AirbnbStaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('airbnb_stays', '[]', zipsonTransforms)
const initialLocalStorageStaysValue = localStorageStays.get()

export function AirbnbStaysProvider({ children }) {
    const [stays, setStaysState] = useState(initialLocalStorageStaysValue)
    const setStays = useStatePersistedCallback(stays, setStaysState, localStorageStays.set.bind(localStorageStays))

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

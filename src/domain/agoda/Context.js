import { createContext, useState, useContext, useMemo } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const AgodaStaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('agoda_stays', '[]', zipsonTransforms)
const initialLocalStorageStaysValue = localStorageStays.get()

export function AgodaStaysProvider({ children }) {
    const [stays, setStaysState] = useState(initialLocalStorageStaysValue)
    const setStays = useStatePersistedCallback(stays, setStaysState, localStorageStays.set.bind(localStorageStays))

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
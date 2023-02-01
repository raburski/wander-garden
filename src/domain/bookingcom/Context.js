import { createContext, useState, useContext, useMemo } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'

export const BookingStaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('booking_stays', '[]', zipsonTransforms)
const initialLocalStorageStaysValue = localStorageStays.get()

export function BookingStaysProvider({ children }) {
    const [stays, setStaysState] = useState(initialLocalStorageStaysValue)
    const setStays = useStatePersistedCallback(stays, setStaysState, localStorageStays.set.bind(localStorageStays))

    const value = useMemo(() => ({
        stays: [stays, setStays],
    }), [stays.length])

    return (
        <BookingStaysContext.Provider value={value}>
            {children}
        </BookingStaysContext.Provider>
    )
}

export function useBookingStays() {
    const context = useContext(BookingStaysContext)
    return context.stays
}

export function useClearData() {
    const [_, setStays] = useBookingStays()
    return () => setStays([])
}

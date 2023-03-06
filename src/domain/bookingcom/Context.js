import { createContext, useState, useContext, useMemo } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback, useSyncedStorage } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const BookingStaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('booking_stays', '[]', zipsonTransforms)

export function BookingStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(localStorageStays)
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

export function isBookingData(data) {
    return isArrayOfType(data, isStayType)
}
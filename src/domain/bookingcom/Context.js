import { createContext, useContext, useMemo } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import { isStayType } from "domain/stay"
import { isArrayOfType } from "type"

export const BookingStaysContext = createContext({})

export const bookingStaysStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'booking')

export function BookingStaysProvider({ children }) {
    const [stays, setStays] = useSyncedStorage(bookingStaysStorage)

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
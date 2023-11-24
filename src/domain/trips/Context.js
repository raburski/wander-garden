import { createContext, useContext } from "react"
import { IndexedDBStorageAdapter, useSyncedStorage } from 'storage'
import moment from 'moment'
import getTrips from "./getTrips"

export const TripsContext = createContext({})

const tripsStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'trips')

export function TripsProvider({ children }) {
    const [trips, setTrips] = useSyncedStorage(tripsStorage)

    async function refresh() {
        const trips = await getTrips()
        await setTrips(trips, trips.map(t => t.id))
    }

    const sortedTrips = [...trips].sort((a, b) => moment(b.since).diff(moment(a.since)))
    const value = {
        trips: sortedTrips,
        refresh
    }

    return (
        <TripsContext.Provider value={value}>
            {children}
        </TripsContext.Provider>
    )
}

export function useTrips() {
    const context = useContext(TripsContext)
    return context.trips
}

export function useTrip(id) {
    const context = useContext(TripsContext)
    return context.trips.find(t => t.id === id)
}

export function useRefreshTrips() {
    const context = useContext(TripsContext)
    return context.refresh
}

export async function getAllTrips() {
    return await tripsStorage.get()
}

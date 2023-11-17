import { createContext, useContext, useMemo } from "react"
import { LocalStorageAdapter, IndexedDBStorageAdapter, jsonTransforms, useSyncedStorage } from 'storage'
import { onlyUnique } from "array"
import { onlyNonTransportation } from "domain/swarm/categories"
import moment from 'moment'
import { checkinsStorage } from "domain/swarm"
import { getAllStays } from "domain/stays"
import { homesStorage, useRefreshHomes } from "domain/homes"
import getTrips from "./getTrips"

export const TripsContext = createContext({})

const visitedStorage = new LocalStorageAdapter('trips.visited', '[]', jsonTransforms)

const tripsStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'trips')

export function TripsProvider({ children }) {
    const [trips, setTrips] = useSyncedStorage(tripsStorage)
    const [visitedCountryCodes, setVisitedCountryCodes] = useSyncedStorage(visitedStorage)

    async function refresh() {
        const trips = await getTrips()
        setTrips(trips, trips.map(t => t.id))
    }

    const sortedTrips = [...trips].sort((a, b) => moment(b.since).diff(moment(a.since)))
    const value = {
        trips: sortedTrips,
        visitedCountryCodes: [visitedCountryCodes, setVisitedCountryCodes],
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

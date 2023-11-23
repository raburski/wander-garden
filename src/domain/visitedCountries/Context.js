import { onlyUnique } from "array"
import { getAllStays } from "domain/stays"
import { checkinsStorage } from "domain/swarm"
import { onlyNonTransportation } from "domain/swarm/categories"
import { createContext, useContext } from "react"
import { LocalStorageAdapter, jsonTransforms, useSyncedStorage } from 'storage'

export const VisitedCountriesContext = createContext({})

const localStorageVisited = new LocalStorageAdapter('visited', '[]', jsonTransforms)

export function VisitedCountriesProvider({ children }) {
    const [visitedCountryCodes, setVisitedCountryCodes] = useSyncedStorage(localStorageVisited)

    async function refresh() {
        const checkins = await checkinsStorage.get()
        const allStays = await getAllStays()

        const nonTransportCheckins = checkins.filter(onlyNonTransportation)

        setVisitedCountryCodes([
            ...nonTransportCheckins.map(checkin => checkin?.venue?.location?.cc.toLowerCase()),
            ...allStays.map(stay => stay.location.cc.toLowerCase()),
        ].filter(onlyUnique).filter(Boolean).reverse())
    }

    const value = {
        visited: [visitedCountryCodes, setVisitedCountryCodes],
        refresh,
    }

    return (
        <VisitedCountriesContext.Provider value={value}>
            {children}
        </VisitedCountriesContext.Provider>
    )
}

export function useVisitedCountryCodes() {
    const context = useContext(VisitedCountriesContext)
    return context.visited[0]
}

export function useRefreshVisited() {
    const context = useContext(VisitedCountriesContext)
    return context.refresh
}


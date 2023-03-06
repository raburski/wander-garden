import { createContext, useState, useContext, useMemo } from "react"
import { jsonTransforms, LocalStorageAdapter, useStatePersistedCallback, usePersistedEffect, useSyncedStorage } from 'storage'
import { useCheckins } from "domain/swarm"
import { getPotentialHomes } from "./functions"

export const HomesContext = createContext({})

const localStorageHomes = new LocalStorageAdapter('homes', '[]', jsonTransforms)

export function HomesProvider({ children }) {
    const [homes, setHomes] = useSyncedStorage(localStorageHomes)
    const [checkins] = useCheckins()

    usePersistedEffect(() => {
        // Use airbnb and booking for potential homes
        // You'd never book a hotel for your home town
        setHomes(getPotentialHomes(checkins))
    }, [checkins.length])


    const value = useMemo(() => ({
        homes: [homes, setHomes],
    }), [homes.length])
    return (
        <HomesContext.Provider value={value}>
            {children}
        </HomesContext.Provider>
    )
}

export function useHomes() {
    const context = useContext(HomesContext)
    return context.homes
}

import { createContext, useState, useContext, useMemo } from "react"
import { jsonTransforms, LocalStorageAdapter, useStatePersistedCallback, usePersistedEffect, useSyncedStorage } from 'storage'
import { useCheckins } from "domain/swarm"
import { getPotentialHomes } from "./functions"
import { checkinsStorage } from "domain/swarm"

export const HomesContext = createContext({})

export const homesStorage = new LocalStorageAdapter('homes', '[]', jsonTransforms)

export function HomesProvider({ children }) {
    const [homes, setHomes] = useSyncedStorage(homesStorage)

    async function refresh() {
        const checkins = await checkinsStorage.get()
        const potentialHomes = getPotentialHomes(checkins)
        setHomes(potentialHomes)
    }

    const value = useMemo(() => ({
        homes: [homes, setHomes],
        refresh,
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

export function useRefreshHomes() {
    const context = useContext(HomesContext)
    return context.refresh
}
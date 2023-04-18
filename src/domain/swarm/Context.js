import { createContext, useState, useContext, useMemo } from "react"
import { fetchCheckins, UnauthorizedError } from './API'
import { dateTransforms, zipsonTransforms, stringTransforms, LocalStorageAdapter, useStatePersistedCallback, useSyncedStorage, IndexedDBStorageAdapter } from 'storage'
import moment from 'moment'

export const SwarmContext = createContext({})

const localStorageLastUpdated = new LocalStorageAdapter('swarm_checkins_last_update', null, dateTransforms)
const localStorageToken = new LocalStorageAdapter('access_token', null, stringTransforms)

export const checkinsStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'checkins')

export function SwarmProvider({ children }) {
    const [checkins, setCheckins] = useSyncedStorage(checkinsStorage)
    const [lastUpdated, setLastUpdated] = useSyncedStorage(localStorageLastUpdated)
    const [token, setToken] = useSyncedStorage(localStorageToken)

    const sortedCheckins = [...checkins]
    sortedCheckins.sort((a, b) => b.createdAt - a.createdAt)
    
    const value = useMemo(() => ({
        checkins: [sortedCheckins, setCheckins],
        lastUpdated: [lastUpdated, setLastUpdated],
        token: [token, setToken],
    }), [checkins.length, lastUpdated, token])

    return (
        <SwarmContext.Provider value={value}>
            {children}
        </SwarmContext.Provider>
    )
}

export function useCheckins() {
    const context = useContext(SwarmContext)
    return context.checkins
}

export function useLastUpdated() {
    const context = useContext(SwarmContext)
    return context.lastUpdated
}

export function useToken() {
    const context = useContext(SwarmContext)
    return context.token
}

export function useIsAuthenticated() {
    const [token] = useToken()
    return !!token
}

export function useClearData() {
    const [_, setCheckins] = useCheckins()
    const [__, setLastUpdated] = useLastUpdated()
    return async function clearData() {
        await checkinsStorage.clearAll()
        await setCheckins([])
        await setLastUpdated(null)
    }
}

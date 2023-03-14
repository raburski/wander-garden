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

export function useFetchCheckins() {
    const [checkins, setCheckins] = useCheckins()
    const [_, setLastUpdated] = useLastUpdated()
    const [token, setToken] = useToken()
    const latestCheckinIDs = [checkins[0], checkins[1], checkins[2]].filter(Boolean).map(c => c.id)

    return async function fetchCheckinsHook() {
        try {
            const fetchedCheckins = await fetchCheckins(token, latestCheckinIDs)
            const newCheckins = [
                ...fetchedCheckins,
                ...checkins,
            ]
            await setCheckins(newCheckins)
            await setLastUpdated(moment())

        } catch (e) {
            if (e === UnauthorizedError) {
                await setToken(null)
            }
            throw e
        }
    }
}

export function useClearData() {
    const [_, setCheckins] = useCheckins()
    const [__, setLastUpdated] = useLastUpdated()
    return async function clearData() {
        await setCheckins([])
        await setLastUpdated(null)
    }
}

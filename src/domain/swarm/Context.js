import { createContext, useContext, useMemo } from "react"
import { dateTransforms, stringTransforms, LocalStorageAdapter, useSyncedStorage, IndexedDBStorageAdapter } from 'storage'

export const SwarmContext = createContext({})

const localStorageLastUpdated = new LocalStorageAdapter('swarm_checkins_last_update', null, dateTransforms)
const localStorageToken = new LocalStorageAdapter('swarm_access_token', null, stringTransforms)

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

export function useReplaceAllCheckins() {
    const context = useContext(SwarmContext)
    return (checkins = []) => context.checkins[1](checkins)
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

export function useLogout() {
    const [_, setToken] = useToken()
    return () => setToken(null)
}

export async function getAllCheckins() {
    return await checkinsStorage.get()
}
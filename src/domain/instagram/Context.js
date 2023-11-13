import { createContext, useState, useContext, useMemo } from "react"
import { dateTransforms, stringTransforms, LocalStorageAdapter, useSyncedStorage, IndexedDBStorageAdapter } from 'storage'

export const InstagramContext = createContext({})

const localStorageLastUpdated = new LocalStorageAdapter('instagram_checkins_last_update', null, dateTransforms)
const localStorageToken = new LocalStorageAdapter('instagram_access_token', null, stringTransforms)

// export const checkinsStorage = new IndexedDBStorageAdapter([], 'wander-garden', 'checkins')

export function InstagramProvider({ children }) {
    // const [checkins, setCheckins] = useSyncedStorage(checkinsStorage)
    const [lastUpdated, setLastUpdated] = useSyncedStorage(localStorageLastUpdated)
    const [token, setToken] = useSyncedStorage(localStorageToken)
    
    const value = useMemo(() => ({
        lastUpdated: [lastUpdated, setLastUpdated],
        token: [token, setToken],
    }), [lastUpdated, token])

    return (
        <InstagramContext.Provider value={value}>
            {children}
        </InstagramContext.Provider>
    )
}

export function useLastUpdated() {
    const context = useContext(InstagramContext)
    return context.lastUpdated
}

export function useToken() {
    const context = useContext(InstagramContext)
    return context.token
}

export function useIsAuthenticated() {
    const [token] = useToken()
    return !!token
}

export function useClearData() {
    // const [_, setCheckins] = useCheckins()
    const [__, setLastUpdated] = useLastUpdated()
    return async function clearData() {
        // await checkinsStorage.clearAll()
        // await setCheckins([])
        await setLastUpdated(null)
    }
}

export function useLogout() {
    const [_, setToken] = useToken()
    return () => setToken(null)
}

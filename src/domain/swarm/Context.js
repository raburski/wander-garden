import { createContext, useState, useContext, useMemo } from "react"
import { fetchCheckins, UnauthorizedError } from './API'
import { dateTransforms, zipsonTransforms, stringTransforms, LocalStorageAdapter, useStatePersistedCallback, useSyncedStorage } from 'storage'
import moment from 'moment'

export const SwarmContext = createContext({})

const localStorageCheckins = new LocalStorageAdapter('swarm_checkins', '[]', zipsonTransforms)
const localStorageLastUpdated = new LocalStorageAdapter('swarm_checkins_last_update', null, dateTransforms)
const localStorageToken = new LocalStorageAdapter('access_token', null, stringTransforms)

export function SwarmProvider({ children }) {
    const [checkins, setCheckins] = useSyncedStorage(localStorageCheckins)
    const [lastUpdated, setLastUpdated] = useSyncedStorage(localStorageLastUpdated)
    const [token, setToken] = useSyncedStorage(localStorageToken)
    
    const value = useMemo(() => ({
        checkins: [checkins, setCheckins],
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

    return function fetchCheckinsHook() {
        return fetchCheckins(token, latestCheckinIDs).then(fetchedCheckins => {
            const newCheckins = [
                ...fetchedCheckins,
                ...checkins,
            ]
            setCheckins(newCheckins)
            setLastUpdated(moment())
        }).catch(e => {
            if (e === UnauthorizedError) {
                setToken(null)
            }
            throw e
        })
    }
}

export function useClearData() {
    const [_, setCheckins] = useCheckins()
    const [__, setLastUpdated] = useLastUpdated()
    return () => {
        setCheckins([])
        setLastUpdated(null)
    }
}

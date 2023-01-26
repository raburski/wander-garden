import { createContext, useState, useContext, useMemo } from "react"
import { fetchCheckins, UnauthorizedError } from './API'
import { dateTransforms, zipsonTransforms, stringTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'
import moment from 'moment'

export const SwarmContext = createContext({})

const localStorageCheckins = new LocalStorageAdapter('swarm_checkins', '[]', zipsonTransforms)
const localStorageLastUpdated = new LocalStorageAdapter('swarm_checkins_last_update', null, dateTransforms)
const localStorageToken = new LocalStorageAdapter('access_token', null, stringTransforms)

const initialLocalStorageCheckinsValue = localStorageCheckins.get()
const initialLocalStorageLastUpdatedValue = localStorageLastUpdated.get()
const initialLocalStorageTokenValue = localStorageToken.get()

export function SwarmProvider({ children }) {
    const [checkins, setCheckinsState] = useState(initialLocalStorageCheckinsValue)
    const [lastUpdated, setLastUpdatedState] = useState(initialLocalStorageLastUpdatedValue)
    const [token, setTokenState] = useState(initialLocalStorageTokenValue)

    const setCheckins = useStatePersistedCallback(checkins, setCheckinsState, localStorageCheckins.set.bind(localStorageCheckins))
    const setLastUpdated = useStatePersistedCallback(lastUpdated, setLastUpdatedState, localStorageLastUpdated.set.bind(localStorageLastUpdated))
    const setToken = useStatePersistedCallback(token, setTokenState, localStorageToken.set.bind(localStorageToken))

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

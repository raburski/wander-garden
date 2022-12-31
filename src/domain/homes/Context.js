import { createContext, useState, useContext } from "react"
import { jsonTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'
import { useCheckins } from "domain/swarm"
import { getPotentialHomes } from "./functions"

export const HomesContext = createContext({})

const localStorageHomes = new LocalStorageAdapter('homes', null, jsonTransforms)
const initialLocalStorageHomesValue = localStorageHomes.get()

export function HomesProvider(props) {
    const [homes, setHomesState] = useState(initialLocalStorageHomesValue)
    const [checkins] = useCheckins()

    const setHomes = useStatePersistedCallback(homes, setHomesState, localStorageHomes.set.bind(localStorageHomes))

    if (homes === null) {
        setHomes(getPotentialHomes(checkins))
    }

    // TODO: add caching etc
    const refresh = () => {
        setHomesState(null)
    }

    const value = {
        homes: [homes, setHomes],
        refresh,
    }
    return <HomesContext.Provider value={value} {...props}/>
}

export function useRefreshHomes() {
    const context = useContext(HomesContext)
    return context.refresh
}

export function useHomes() {
    const context = useContext(HomesContext)
    return context.homes
}

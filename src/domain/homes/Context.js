import { createContext, useState, useContext, useMemo } from "react"
import { jsonTransforms, LocalStorageAdapter, useStatePersistedCallback, usePersistedEffect } from 'storage'
import { useCheckins } from "domain/swarm"
import { getPotentialHomes } from "./functions"

export const HomesContext = createContext({})

const localStorageHomes = new LocalStorageAdapter('homes', '[]', jsonTransforms)
const initialLocalStorageHomesValue = localStorageHomes.get()

export function HomesProvider({ children }) {
    const [homes, setHomesState] = useState(initialLocalStorageHomesValue)
    const [checkins] = useCheckins()

    const setHomes = useStatePersistedCallback(homes, setHomesState, localStorageHomes.set.bind(localStorageHomes))

    usePersistedEffect(() => {
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

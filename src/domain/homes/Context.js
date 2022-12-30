import { createContext, useState, useContext, useEffect } from "react"
import { dateTransforms, zipsonTransforms, stringTransforms, LocalStorageAdapter, useStatePersistedCallback } from 'storage'
import { useCheckins } from "domain/swarm"
import { getPotentialHomes } from "./functions"
import toast from "react-hot-toast"

export const HomesContext = createContext({})

const localStorageHomes = new LocalStorageAdapter('homes', null, zipsonTransforms)
const initialLocalStorageHomesValue = localStorageHomes.get()

function useCalculatePotentialHomesEffect(checkins, setHomes) {
    useEffect(() => {
        setHomes(getPotentialHomes(checkins))
    }, [checkins.length])
}

export function HomesProvider(props) {
    const [homes, setHomesState] = useState(initialLocalStorageHomesValue)
    const [checkins] = useCheckins()

    const setHomes = useStatePersistedCallback(homes, setHomesState, localStorageHomes.set.bind(localStorageHomes))
    useCalculatePotentialHomesEffect(checkins, setHomes)

    if (homes === null) {
        console.log('CALC HOMES')
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

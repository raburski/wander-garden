import { createContext, useState, useContext } from "react"
import { zipsonTransforms, LocalStorageAdapter, useStatePersistedCallback, jsonTransforms } from 'storage'

export const StaysContext = createContext({})

const localStorageStays = new LocalStorageAdapter('stays', '[]', zipsonTransforms)
const initialLocalStorageStaysValue = localStorageStays.get()

export function StaysProvider(props) {
    const [stays, setStaysState] = useState(initialLocalStorageStaysValue)
    const setStays = useStatePersistedCallback(stays, setStaysState, localStorageStays.set.bind(localStorageStays))

    const value = {
        stays: [stays, setStays],
    }
    return <StaysContext.Provider value={value} {...props}/>
}

export function useStays() {
    const context = useContext(StaysContext)
    return context.stays
}

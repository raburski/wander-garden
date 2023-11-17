import { createContext, useContext } from "react"
import { LocalStorageAdapter, jsonTransforms, useSyncedStorage } from 'storage'

export const TitlesContext = createContext({})

const localStorageTitles = new LocalStorageAdapter('titles', '{}', jsonTransforms)

export function TitlesProvider({ children }) {
    const [titles, setTitles] = useSyncedStorage(localStorageTitles)

    const value = {
        titles: [titles, setTitles],
    }

    return (
        <TitlesContext.Provider value={value}>
            {children}
        </TitlesContext.Provider>
    )
}

export function useTitle(id) {
    const context = useContext(TitlesContext)
    const [titles] = context.titles
    return titles[id]
}

export function useAllTitles() {
    const context = useContext(TitlesContext)
    const [titles] = context.titles
    return titles
}

export function useSetTitle(id) {
    const context = useContext(TitlesContext)
    const [titles, setTitles] = context.titles
    return (title) => setTitles({ ...titles, [id]: title })
}

export function useReplaceAllTitles() {
    const context = useContext(TitlesContext)
    const [_, setTitles] = context.titles
    return (newTitles = {}) => setTitles(newTitles)
}


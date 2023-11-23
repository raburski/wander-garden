import { createContext, useEffect } from "react"
import { LocalStorageAdapter, useSyncedStorage, stringTransforms } from 'storage'
import useRefresh from "domain/refresh"

export const VersionContext = createContext({})

const versionStore = new LocalStorageAdapter('version', '', stringTransforms)

const CURRENT_VERSION = '2'

export function VersionProvider({ children }) {
    const [version, setVersion] = useSyncedStorage(versionStore)
    const refresh = useRefresh()

    useEffect(() => {
        if (version !== CURRENT_VERSION) {
            refresh().then(() => {
                setVersion(CURRENT_VERSION)
            })
        }
    }, [])

    const value = {
        version,
    }

    return (
        <VersionContext.Provider value={value}>
            {children}
        </VersionContext.Provider>
    )
}

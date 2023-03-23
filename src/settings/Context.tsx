import { createContext, useState, useContext, useMemo } from "react"
import { jsonTransforms, LocalStorageAdapter, useSyncedStorage } from '../storage'

type Settings = {[name: string]: any}
type ProviderProps = {[name: string]: any}
type SetSettings = (settings: Settings) => void

export const SettingsContext = createContext<Settings>({})
const Provider = SettingsContext.Provider

const localStorageSettings = new LocalStorageAdapter<Settings>('settings', '{}', jsonTransforms)

export function SettingsProvider({ children }: ProviderProps): JSX.Element {
    const [settings, setSettings] = useSyncedStorage(localStorageSettings)

    const value = useMemo(() => ({
        settings: [settings, setSettings]
    }), [settings])
    return (
        <Provider value={value}>
            {children}
        </Provider>
    )
}

export function useSettings(): [Settings, SetSettings] {
    const context = useContext(SettingsContext)
    return context.settings
}

export function useSetting(name: string, defaultValue: any) {
    const [settings, setSettings] = useSettings()
    const setSetting = (value: any) => setSettings({ ...settings, [name]: value }) 
    return [settings[name] === undefined ? defaultValue : settings[name], setSetting]
}


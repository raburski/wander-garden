import { createContext, useState, useContext, useMemo } from "react"
import { jsonTransforms, useStatePersistedCallback, LocalStorageAdapter } from '../storage'

type Settings = {[name: string]: any}
type ProviderProps = {[name: string]: any}
type SetSettings = (settings: Settings) => void

export const SettingsContext = createContext<Settings>({})
const Provider = SettingsContext.Provider

const localStorageSettings = new LocalStorageAdapter<Settings>('settings', '{}', jsonTransforms)
const initialLocalStorageSettingsValue = localStorageSettings.get()

export function SettingsProvider({ children }: ProviderProps): JSX.Element {
    const [settings, setSettingsState] = useState(initialLocalStorageSettingsValue)
    const setSettings = useStatePersistedCallback(settings, setSettingsState, localStorageSettings.set.bind(localStorageSettings))

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

export function useSetting(name: string) {
    const [settings, setSettings] = useSettings()
    const setSetting = (value: any) => setSettings({ ...settings, [name]: value }) 
    return [settings[name], setSetting]
}


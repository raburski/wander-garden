import { createContext, useState, useContext } from "react"
import { jsonTransforms, useStatePersistedCallback, LocalStorageAdapter } from '../storage'

export const SettingsContext = createContext({})

const localStorageSettings = new LocalStorageAdapter('settings', '{}', jsonTransforms)
const initialLocalStorageSettingsValue = localStorageSettings.get()

export function SettingsProvider(props) {
    const [settings, setSettingsState] = useState(initialLocalStorageSettingsValue)
    const setSettings = useStatePersistedCallback(settings, setSettingsState, localStorageSettings.set.bind(localStorageSettings))
    const value = {
        settings: [settings, setSettings],
    }
    return <SettingsContext.Provider value={value} {...props}/>
}

export function useSettings() {
    const context = useContext(SettingsContext)
    return context.settings
}

export function useSetting(name) {
    const [settings, setSettings] = useSettings()
    const setSetting = (value) => setSettings({ ...settings, [name]: value }) 
    return [settings[name], setSetting]
}


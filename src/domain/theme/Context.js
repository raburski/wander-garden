import { createContext, useContext, useEffect, useState } from "react"
import { ColorTheme } from "./types"
import { DARK, LIGHT } from "./colors"
import { useSetting } from "settings"

const initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? ColorTheme.Dark : ColorTheme.Light
export const ThemeContext = createContext(initialTheme)

const MODE_SETTING_NAME = 'color_mode'
export function useColorMode() {
    return useSetting(MODE_SETTING_NAME, ColorTheme.Automatic)
}


export function ThemeProvider({ children }) {
    const [systemTheme, setSystemTheme] = useState(initialTheme)
    const [mode] = useColorMode()

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', event => {
            const colorScheme = event.matches ? ColorTheme.Dark : ColorTheme.Light
            setSystemTheme(colorScheme)
          })
    }, [])

    const theme = mode === ColorTheme.Automatic ? systemTheme : mode
    const colors = theme === ColorTheme.Dark ? DARK : LIGHT
    document.body.style.backgroundColor = colors.background.default

    const value = {
        systemTheme,
        theme,
        colors,
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext).theme
}

export function useThemeColors() {
    return useContext(ThemeContext).colors
}


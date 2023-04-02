import { createContext, useContext, useEffect, useState } from "react"
import { ColorTheme } from "./types"
import { DARK, LIGHT } from "./colors"

const initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? ColorTheme.Dark : ColorTheme.Light
export const ThemeContext = createContext(initialTheme)

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(initialTheme)

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', event => {
            const colorScheme = event.matches ? ColorTheme.Dark : ColorTheme.Light
            setTheme(colorScheme)
          })
    }, [])

    const colors = theme === ColorTheme.Dark ? DARK : LIGHT
    document.body.style.backgroundColor = colors.background.default

    const value = {
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
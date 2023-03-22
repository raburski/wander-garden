import { useEffect } from "react"

const SCROLL_STATE = {}
export default function usePersistedScroll(key, elementId = 'routes-container') {
    useEffect(() => {
        const element = document.getElementById(elementId)
        const state = SCROLL_STATE[key]
        if (state) {
            element.scrollTo(0, state)
        }

        function listener(event) {
            SCROLL_STATE[key] = event.target.scrollTop
        }

        element.addEventListener('scroll', listener, true)
        return () => {
            element.removeEventListener('scroll', listener, true)
        }
    }, [])
}
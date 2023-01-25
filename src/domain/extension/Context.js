import { createContext, useState, useContext } from "react"
import { useStays } from 'domain/stays'

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: 'wander_garden',
        ...msg,
    }, '*')
}

export function ExtensionProvider(props) {
    const [isConnected, setConnected] = useState(false)
    const [stays, setStays] = useStays()

    window.addEventListener('message', function(event) {
        const message = event.data
        if (!message) { return }
        if (message.source === 'wander_garden_extension') {
            if (!isConnected) {
                setConnected(true)
            }
            if (message.type === 'capture_finished') {
                if (message.subject === 'booking.com_extension') {
                    setStays(message.stays)
                }
            }
        }
    })

    const value = {
        isConnected
    }
    return <ExtensionContext.Provider value={value} {...props}/>
}

export function useIsConnected() {
    const context = useContext(ExtensionContext)
    return context.isConnected
}

export function useScrapeBooking() {
    return function scrapeBooking() {
        sendExtensionMessage({ type: 'start_capture', subject: 'booking.com_extension', target: 'wander_garden_extension' })
    }
}
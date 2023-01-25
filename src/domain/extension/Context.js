import { createContext, useState, useContext } from "react"
import { useStays } from 'domain/stays'

const CURRENT_VERSION = '1.0'

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: 'wander_garden',
        ...msg,
    }, '*')
}

export function ExtensionProvider(props) {
    const [version, setVersion] = useState()
    const [stays, setStays] = useStays()

    window.addEventListener('message', function(event) {
        const message = event.data
        if (!message) { return }
        if (message.source === 'wander_garden_extension') {
            if (message.type === 'init') {
                setVersion(message.version)
            }
            if (message.type === 'capture_finished') {
                if (message.subject === 'booking.com_extension') {
                    setStays(message.stays)
                }
            }
        }
    })

    const value = {
        isConnected: !!version,
        version,
    }
    return <ExtensionContext.Provider value={value} {...props}/>
}

export function useIsConnected() {
    const context = useContext(ExtensionContext)
    return context.isConnected
}

export function useIsMatchingVersion() {
    const context = useContext(ExtensionContext)
    return context.version === CURRENT_VERSION
}

export function useScrapeBooking() {
    return function scrapeBooking() {
        sendExtensionMessage({ type: 'start_capture', subject: 'booking.com_extension', target: 'wander_garden_extension' })
    }
}
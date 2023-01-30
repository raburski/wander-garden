import { createContext, useState, useContext, useMemo } from "react"
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'

const CURRENT_VERSION = '1.0'

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: 'wander_garden',
        ...msg,
    }, '*')
}

export function ExtensionProvider({ children }) {
    const [version, setVersion] = useState()
    const [_, setBookingStays] = useBookingStays()
    const [__, setAirbnbStays] = useAirbnbStays()

    window.addEventListener('message', function(event) {
        const message = event.data
        if (!message) { return }
        if (message.source === 'wander_garden_extension') {
            if (message.type === 'init') {
                setVersion(message.version)
            }
            if (message.type === 'capture_finished') {
                if (message.subject === 'booking.com_extension') {
                    setBookingStays(message.stays)
                } else if (message.subject === 'airbnb_extension') {
                    setAirbnbStays(message.stays)
                }
            }
        }
    })

    const value = useMemo(() => ({
        isConnected: !!version,
        version,
    }), [version])

    return (
        <ExtensionContext.Provider value={value}>
            {children}
        </ExtensionContext.Provider>
    )
}

export function useIsConnected() {
    const context = useContext(ExtensionContext)
    return context.isConnected
}

export function useIsMatchingVersion() {
    const context = useContext(ExtensionContext)
    return context.version === CURRENT_VERSION
}

export function useCaptureBooking() {
    return function captureBooking() {
        sendExtensionMessage({ type: 'start_capture', subject: 'booking.com_extension', target: 'wander_garden_extension' })
    }
}

export function useCaptureAirbnb() {
    return function captureAirbnb() {
        sendExtensionMessage({ type: 'start_capture', subject: 'airbnb_extension', target: 'wander_garden_extension' })
    }
}
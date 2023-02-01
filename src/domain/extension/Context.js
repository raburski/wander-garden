import { createContext, useState, useContext, useMemo } from "react"
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'

const CURRENT_VERSION = '0.0.1'

export const STATUS = {
    UNKNOWN: 'UNKNOWN',
    CONNECTED: 'CONNECTED',
    FAILED: 'FAILED',
    INCOMPATIBLE: 'INCOMPATIBLE',
}

export const ExtensionContext = createContext({})

function sendExtensionMessage(msg) {
    window.postMessage({
        source: 'wander_garden',
        ...msg,
    }, '*')
}

export function ExtensionProvider({ children }) {
    const [version, setVersion] = useState()
    const [failed, setFailed] = useState(false)
    const [_, setBookingStays] = useBookingStays()
    const [__, setAirbnbStays] = useAirbnbStays()

    window.addEventListener('message', function(event) {
        const message = event.data
        if (!message) { return }
        if (message.source === 'wander_garden_extension' || message.source === 'wander_garden') {
            if (message.type === 'init') {
                setVersion(message.version)
            } else if (message.type === 'init_failed') {
                setFailed(true)
            } else if (message.type === 'capture_finished') {
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
        failed,
    }), [version])

    return (
        <ExtensionContext.Provider value={value}>
            {children}
        </ExtensionContext.Provider>
    )
}

export function useExtensionStatus() {
    const context = useContext(ExtensionContext)
    if (context.failed) {
        return STATUS.FAILED
    } else if (context.version !== CURRENT_VERSION) {
        return STATUS.INCOMPATIBLE
    } else if (context.isConnected) {
        return STATUS.CONNECTED
    } else {
        return STATUS.UNKNOWN
    }
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
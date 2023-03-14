import { createContext, useState, useContext, useMemo, useEffect } from "react"
import { useBookingStays } from 'domain/bookingcom'
import { useAirbnbStays } from 'domain/airbnb'
import { useAgodaStays } from "domain/agoda"
import { useRefreshHomes } from "domain/homes"
import { useRefreshTimeline } from "domain/timeline"

const CURRENT_VERSION = '0.0.3'

export const STATUS = {
    UNKNOWN: 'UNKNOWN',
    CONNECTED: 'CONNECTED',
    FAILED: 'FAILED',
    INCOMPATIBLE: 'INCOMPATIBLE',
    CAPTURING: 'CAPTURING',
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
    const [capturing, setCapturing] = useState(false)
    const [_, setBookingStays] = useBookingStays()
    const [__, setAirbnbStays] = useAirbnbStays()
    const [___, setAgodaStays] = useAgodaStays()

    const refreshHomes = useRefreshHomes()
    const refreshTimeline = useRefreshTimeline()

    useEffect(() => {
        async function refresh() {
            await refreshHomes()
            await refreshTimeline()
        }

        async function eventListener(event) {
            const message = event.data
            if (!message) { return }
            if (message.source === 'wander_garden_extension' || message.source === 'wander_garden') {
                if (message.type === 'init') {
                    setVersion(message.version)
                } else if (message.type === 'init_failed') {
                    setFailed(true)
                } else if (message.type === 'capture_finished') {
                    setCapturing(false)
                    if (message.subject === 'booking.com_extension') {
                        await setBookingStays(message.stays)
                    } else if (message.subject === 'airbnb_extension') {
                        await setAirbnbStays(message.stays)
                    } else if (message.subject === 'agoda_extension') {
                        await setAgodaStays(message.stays)
                    }
                    await refresh()
                }
            }
        }
        if (!failed) {
            window.addEventListener('message', eventListener)
        }
        return () => window.removeEventListener('message', eventListener)
    }, [failed, refreshHomes, refreshTimeline, setFailed, setCapturing, setVersion, setBookingStays, setAirbnbStays])

    const startCapture = (subject) => {
        setCapturing(true)
        sendExtensionMessage({ type: 'start_capture', subject, target: 'wander_garden_extension' })
    }

    const value = useMemo(() => ({
        isConnected: !!version,
        version,
        failed,
        capturing,
        startCapture,
    }), [version, failed, capturing])

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
    } else if (context.version && context.version !== CURRENT_VERSION) {
        return STATUS.INCOMPATIBLE
    } else if (context.capturing) {
        return STATUS.CAPTURING
    } else if (context.isConnected) {
        return STATUS.CONNECTED
    } else {
        return STATUS.UNKNOWN
    }
}

export function useCaptureBooking() {
    const context = useContext(ExtensionContext)
    return function captureBooking() {
        context.startCapture('booking.com_extension')
    }
}

export function useCaptureAirbnb() {
    const context = useContext(ExtensionContext)
    return function captureAirbnb() {
        context.startCapture('airbnb_extension')
    }
}

export function useCaptureAgoda() {
    const context = useContext(ExtensionContext)
    return function captureAgoda() {
        context.startCapture('agoda_extension')
    }
}